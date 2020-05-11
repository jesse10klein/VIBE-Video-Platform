const express = require('express')
const router = express.Router();
const path = require('path');
const db = require(path.join(__dirname, '../db'));
const { Video } = db.models;
const { Bookmarks } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;
const { videoVotes } = db.models;
const { commentVotes } = db.models;
const { Notifications } = db.models;

//Require helper functions
var tools = require(path.join(__dirname, 'helperFunctions'));

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());



//Home VIDEO route
router.get('/', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;

  let videos = await Video.findAll({ 
    order: [["createdAt", "DESC"]]
  });
  if (videos.length == 0) {
    videos = null;
  } else {
    for (video of videos) {
      video = await tools.formatVideo(video);
    }
  }
  res.render("videoViews/video", {videos, username});
}));

//Send user the subs
router.get('/subscriptions', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  
  if (username == null) {
    res.redirect('/users/login');
    return;
  }

  const subVids = await tools.getSubVideos(username);

  res.render("videoViews/subscriptions", {subVids, username});

}));

//Create new comment
router.post('/:id/add-comment', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  //Check that the video exists
  const video = await Video.findOne({where: {id: req.params.id}});
  if (video == null) {
    res.render("404", {message: "The video that you have requested does not exist"});
  }

  const comment = await Comments.create({
      user: req.session.username,
      videoID: req.params.id,
      comment: req.body.comment
  });

  //Notify uploader that their video has been commented on
  await Notifications.create({
    user: username,
    notificationType: "Comment",
    recipient: video.uploader,
    contentID: video.id
  });

  //Get user's profile pic and attach it
  const user = await UserInfo.findOne({where: {username}});
  const imageURL = user.imageURL

  res.send({comment, imageURL});
}));

//Sorting comments under video
router.get('/:id', tools.asyncHandler(async (req, res) => {

  let video = await Video.findByPk(req.params.id);
  if (video == null) {
    res.render("404", {message: "The video you have requested does not exist"});
  }

  const {username} = req.session;

  video.formattedTags = tools.parseTags(video.tags);

  const newViewCount = video.viewCount + 1;
  await video.update({ viewCount: newViewCount });

  let uploader = await UserInfo.findOne({
    where: {username: video.uploader}
  })

  if (uploader == null) {
    res.render("404", { message: "The uploader of the referenced video has recently deleted their account" });
  }

  //Make uploader sub count readable
  uploader.formattedSubscriberCount = tools.formatViews(uploader.subscriberCount);

  let videos = await tools.getSidebarVideos(username);
  if (videos.length > 10) {
    videos = videos.slice(0, 10);
  }

  //Format date for video
  video.formattedDate = tools.formatDate(video.createdAt);
  video.formattedViews = tools.formatViews(video.viewCount);
  video.formattedUpvotes = tools.formatViews(video.upvotes);
  video.formattedDownvotes = tools.formatViews(video.downvotes);


  //Get comments
  let comments = await tools.getCommentsForVideo(req.params.id, username, "new");
  let numComments = comments.length;

  //Count comments
  for (let i = 0; i < comments.length; i++) {
    const replies = await Comments.findAll({where: {replyID: comments[i].id}});
    numComments += replies.length;
  }

  //Only give the first 5 comments
  if (comments.length > 1) {
    comments = comments.splice(0, 1);
  }

  //Check if user is subscribed to the uploader
  let subscribed = false;
  if (req.session.username) {
    const subscription = await Subscriptions.findOne({
      where: {user: uploader.username, subscriber: username}
    })
    subscribed = !(subscription == null);
  }
  res.render("videoViews/video-specific", {video, comments, uploader, username, subscribed, videos, numComments});
}));

//Handle subbing/unsubbing
router.post('/:videoID/handle-sub', tools.asyncHandler(async (req, res) => {

  //Make sure user is logged in
  const { username } = req.session;
  if (username == null) {
    res.end();
  }

  const video = await Video.findByPk(req.params.videoID);
  const user = video.uploader;
  const uploader = await UserInfo.findOne({where: { username: user }})

  //Check if user is subscribed
  const subscription = await Subscriptions.findOne({
    where: {subscriber: username, user: uploader.username}});
  

  if (subscription == null) { 
    const sub = await Subscriptions.create({user, subscriber: username});
    const newSubCount = uploader.subscriberCount + 1;
    await uploader.update({ subscriberCount: newSubCount });

    //Notify user that they have been subbed to
    //Make sure there isn't a sub notification yet
    const alreadyExists = await Notifications.findOne({where: {user, recipient: username, notificationType: "Subscribe"}});
    if (alreadyExists == null && user != username) {
      await Notifications.create({
        user: username,
        notificationType: "Subscribe",
        recipient: user,
        contentID: sub.id
      });
    }

    res.status(200).send({subscribers: newSubCount, subscribeStatus: "Unsubscribe"});
  } else {
    await subscription.destroy();
    const newSubCount = uploader.subscriberCount - 1;
    await uploader.update({ subscriberCount: newSubCount });
    res.status(200).send({subscribers: newSubCount, subscribeStatus: "Subscribe"});
  }

}));

//Add upvote
router.post('/:videoID/addUpvote', tools.asyncHandler(async (req, res) => {

  //Get the voting status of the user
  const vote = await videoVotes.findOne({
    where: {
      user: req.session.username, 
      videoID: req.params.videoID}
    });

  const video = await Video.findByPk(req.params.videoID);

  let alreadyVoted = false;

  //If user has video disliked, remove the vote
  if (vote && vote.status == 2) {
    await vote.destroy();
    const newDownvotes = video.downvotes - 1;
    await video.update({downvotes: newDownvotes})
    alreadyVoted = true;
  }

  if (vote && vote.status == 1) {
    await vote.destroy();
    const newUpvoteCount = video.upvotes - 1;
    await video.update({ upvotes: newUpvoteCount });
    res.status(200).send({voteStatus: 1});
    return;
  }

  //Add upvote to db
  await videoVotes.create({
    videoID: req.params.videoID,
    user: req.session.username,
    status: 1
  });

  //Add vote to video
  const newUpvoteCount = video.upvotes + 1;
  await video.update({ upvotes: newUpvoteCount });
  if (alreadyVoted) {
    res.status(200).send({voteStatus: 3});
    return;
  }
  res.status(200).send({voteStatus: 2});
}));

//Add downvote
router.post('/:videoID/addDownvote', tools.asyncHandler(async (req, res) => {

  const video = await Video.findByPk(req.params.videoID);

  //Get the voting status of the user
  const vote = await videoVotes.findOne({
    where: {
      user: req.session.username, 
      videoID: req.params.videoID}
    });
  
  let alreadyVoted = false;

  //If user has video liked, remove the vote
  if (vote && vote.status == 1) {
    await vote.destroy();
    const newUpvotes = video.upvotes - 1;
    await video.update({upvotes: newUpvotes})
    alreadyVoted = true;
  }

  if (vote && vote.status == 2) {
    await vote.destroy();
    const newDownvoteCount = video.downvotes - 1;
    await video.update({ downvotes: newDownvoteCount });
    res.status(200).send({voteStatus: 1});
    return;
  }

  //Add downvote to db
  await videoVotes.create({
    videoID: req.params.videoID,
    user: req.session.username,
    status: 2
  });

  //Add vote to video
  const newDownvoteCount = video.downvotes + 1;
  await video.update({ downvotes: newDownvoteCount });
  if (alreadyVoted) {
    res.status(200).send({voteStatus: 3});
    return;
  }
  res.status(200).send({voteStatus: 2});
}));

//Add upvote to comment
router.post('/:videoID/addCommentLike/:commentID', tools.asyncHandler(async (req, res) => {

  //Get the voting status of the user
  const vote = await commentVotes.findOne({
    where: {
      commentID: req.params.commentID,
      user: req.session.username
    }});

  const comment = await Comments.findByPk(req.params.commentID);

  let alreadyVoted = false;

  //If user has comment disliked, remove the vote
  if (vote && vote.status == 2) {
    await vote.destroy();
    const newDislikes = comment.commentDislikes - 1;
    await comment.update({commentDislikes: newDislikes})
    alreadyVoted = true;
  }

  if (vote && vote.status == 1) {
    await vote.destroy();
    const newLikeCount = comment.commentLikes - 1;
    await comment.update({ commentLikes: newLikeCount });
    res.status(200).send({voteStatus: 1});
    return;
  }

  //Add upvote to db
  await commentVotes.create({
    commentID: req.params.commentID,
    user: req.session.username,
    status: 1
  });

  //Add vote to comment
  const newLikeCount = comment.commentLikes + 1;
  await comment.update({ commentLikes: newLikeCount });
  if (alreadyVoted) {
    res.status(200).send({voteStatus: 3});
    return;
  }
  res.status(200).send({voteStatus: 2});
}));

//Add downvote to comment
router.post('/:videoID/addCommentDislike/:commentID', tools.asyncHandler(async (req, res) => {

  //Get the voting status of the user
  const vote = await commentVotes.findOne({
    where: {
      commentID: req.params.commentID,
      user: req.session.username
    }});

  const comment = await Comments.findByPk(req.params.commentID);

  let alreadyVoted = false;

  //If user has comment liked, remove the vote
  if (vote && vote.status == 1) {
    await vote.destroy();
    const newLikes = comment.commentLikes - 1;
    await comment.update({commentLikes: newLikes})
    alreadyVoted = true;
  }

  if (vote && vote.status == 2) {
    await vote.destroy();
    const newDislikeCount = comment.commentDislikes - 1;
    await comment.update({ commentDislikes: newDislikeCount });
    res.status(200).send({voteStatus: 1});
    return;
  }

  //Add downvote to db
  await commentVotes.create({
    commentID: req.params.commentID,
    user: req.session.username,
    status: 2
  });

  //Add vote to comment
  const newDislikeCount = comment.commentDislikes + 1;
  await comment.update({ commentDislikes: newDislikeCount });
  if (alreadyVoted) {
    res.status(200).send({voteStatus: 3});
    return;
  }
  res.status(200).send({voteStatus: 2});
}));

//Add a reply to a comment
router.post('/:videoID/add-reply/:commentID', tools.asyncHandler(async (req, res) => {

  //Check that the video exists
  const video = await Video.findOne({where: {id: req.params.videoID}});
  if (video == null) {
    res.render("404", {message: "The video that you have requested does not exist"});
  }

  const { username } = req.session;
  if (username == null) {
      res.render("404", {message: "Resource not found"});
  }

  const comment = await Comments.create({
      user: req.session.username,
      videoID: req.params.videoID,
      comment: req.body.reply,
      replyID: req.params.commentID
  });

  //Notify commenter that their comment has been replied to
  const initialComment = await Comments.findOne({where: {id: req.params.commentID}});
  if (username != initialComment.user) {
    await Notifications.create({
      user: username,
      notificationType: "Reply",
      recipient: initialComment.user,
      contentID: video.id
    });
  }

  //Get user's profile pic and attach it
  const user = await UserInfo.findOne({where: {username}});
  const imageURL = user.imageURL;

  res.send({comment, imageURL});
}));

//Handle deleting a comment
router.post('/:vidID/delete-comment/:commentID', tools.asyncHandler(async (req, res) => {

  const comment = await Comments.findOne({where: {
    id: req.params.commentID,
    user: req.session.username
  }});

  if (comment == null) {
      res.render("404", {message: "Could not find what you were looking for"});
      return;
  }
  //Check if the comment has replies and delete them
  const replies = await Comments.findAll({where: {replyID: comment.id}});
  for (let i = 0; i < replies.length; i++) {
    await replies[i].destroy();
  }

  await comment.destroy();
  res.send("Comment deleted");

}));

//Handle bookmarking a video
router.post('/:videoID/bookmark-video', tools.asyncHandler(async (req, res) => {

  //Check if user already has video bookmarked
  const bookmark = await Bookmarks.findOne({where: {
    username: req.session.username,
    videoID: req.params.videoID
  }});

  if (bookmark == null) {
      await Bookmarks.create({
        username: req.session.username,
        videoID: req.params.videoID
      });
    res.send({added: true});
    return;
  } else {
    await bookmark.destroy();
    res.send({added: false});
    return;
  }
}));

//Handle editing a comment
router.post('/:videoID/edit-comment/', tools.asyncHandler(async (req, res) => {

  if (!req.session.username) {
    res.sendStatus(500);
    return;
  }

  const { comment } = req.body;

  //Update comment
  const toUpdate = await Comments.findByPk(req.body.commentID);

  if (comment == null) {
    res.sendStatus(500);
    return;
  }

  await toUpdate.update({comment, edited: '1'});

  res.sendStatus(200);

}));

//Deliver more sidebar videos
router.post('/:id/video-payload/', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;

  //Get videos for sidebar: for now just any videos
  let videos = await tools.getSidebarVideos(username);
  console.log(req.body.lastVideoID);
  console.log(videos.length);

  //Loop through until find id
  for (let i = 0; i < videos.length; i++) {
    console.log(videos[i].id);
    if (videos[i].id == req.body.lastVideoID) {
      videos = videos.splice(i + 1);
      break;
    }
  }

  if (videos.length > 3) {
    videos = videos.splice(0, 3);
  }

  videosToSend = tools.convertVideosAjax(videos);
  console.log(videosToSend);

  res.send({videos: videosToSend})
}));

//Deliver more comments
router.post('/:id/comment-payload/:type/', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;

  let comments = await tools.getCommentsForVideo(req.params.id, username, req.params.type);
  //Loop through until find id
  for (let i = 0; i < comments.length; i++) {
    if (comments[i].id == req.body.lastCommentID) {
      comments = comments.splice(i + 1);
      break;
    }
  }

  if (comments.length > 3) {
    comments = comments.splice(0, 3);
  }
  //Need to do weird conversion thing becuase sequelize is dumb dumb
  commentsToSend = await tools.convertCommentsAjax(comments, username);

  res.send({comments: commentsToSend})

}));

//Deliver more comments and video recs to user
router.post('/:id/reply-payload/:type/', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  const comment = await Comments.findOne({where: {id: req.body.commentID}});

  const replies = await tools.getRepliesForComment(comment, username, req.params.type);

  res.send({replies});

}));

module.exports = router;
