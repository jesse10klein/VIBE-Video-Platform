const express = require('express')
const router = express.Router();

const db = require('../db');
const { Video } = db.models;
const { Bookmarks } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;
const { videoVotes } = db.models;
const { commentVotes } = db.models;

//Require helper functions
var tools = require('./helperFunctions');

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());



//Home VIDEO route
router.get('/', tools.asyncHandler(async (req, res) => {

  let videos = await Video.findAll({ 
    order: [["uploadDate", "DESC"]]
  });
  if (videos.length == 0) {
    videos = null;
  }

  const username = req.session.username;
  res.render("videoViews/video", {videos, username});
}));


//Create new comment
router.post('/:id/add-comment', tools.asyncHandler(async (req, res) => {

    //Check that the video exists
    const video = await Video.findOne({where: {id: req.params.id}});
    if (video == null) {
      res.render("404", {message: "The video that you have requested does not exist"});
    }

    if (req.session.username == null) {
        res.render("404", {message: "Resource not found"});
    }

    const comment = await Comments.create({
        user: req.session.username,
        videoID: req.params.id,
        comment: req.body.comment
    });

    //Get user's profile pic and attach it
    const user = await UserInfo.findOne({where: {username: req.session.username}});
    const imageURL = user.imageURL

    res.send({comment, imageURL});
}));

//Sorting comments under video
router.get('/:id', tools.asyncHandler(async (req, res) => {
    
  let video = await Video.findByPk(req.params.id);
  if (video == null) {
    res.render("404", {message: "The video you have requested does not exist"});
  }
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

  //Get videos for sidebar: for now just any videos
  let videos = await Video.findAll({order: [["createdAt", "DESC"]]});

  //FORMAT THESE VIDEOS (TITLE, VIEWS, UPLOAD)
  for (let i = 0; i < videos.length; i++) {
    videos[i].formattedTitle = tools.formatTitle(videos[i].title);
    videos[i].formattedViews = tools.formatViews(videos[i].viewCount);
    videos[i].formattedUploadDate = tools.formatTimeSince(videos[i].createdAt);
  }

  //Format date for video
  video.formattedDate = tools.formatDate(video.uploadDate);
  video.formattedViews = tools.formatViews(video.viewCount);
  video.formattedUpvotes = tools.formatViews(video.upvotes);
  video.formattedDownvotes = tools.formatViews(video.downvotes);

  const {username} = req.session;

  //Get comments
  const comments = await tools.getCommentsForVideo(req.params.id, username);

  //Check if user is subscribed to the uploader
  let subscribed = false;
  if (req.session.username) {
    const subscription = await Subscriptions.findOne({
      where: {user: uploader.username, subscriber: username}
    })
    subscribed = !(subscription == null);
  }
  res.render("videoViews/video-specific", {video, comments, uploader, username, subscribed, videos});
}));

//Handle subbing/unsubbing
router.post('/:videoID/handle-sub', tools.asyncHandler(async (req, res) => {

  //Make sure user is logged in
  if (req.session.username == null) {
    res.end();
  }

  const video = await Video.findByPk(req.params.videoID);
  const user = video.uploader;
  const uploader = await UserInfo.findOne({where: { username: user }})

  //Check if user is subscribed
  const subscription = await Subscriptions.findOne({
    where: {subscriber: req.session.username}});
  

  if (subscription == null) { 
    await Subscriptions.create({user, subscriber: req.session.username});
    const newSubCount = uploader.subscriberCount + 1;
    await uploader.update({ subscriberCount: newSubCount });
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

  if (req.session.username == null) {
      res.render("404", {message: "Resource not found"});
  }

  const comment = await Comments.create({
      user: req.session.username,
      videoID: req.params.videoID,
      comment: req.body.reply,
      replyID: req.params.commentID
  });

  //Get user's profile pic and attach it
  const user = await UserInfo.findOne({where: {username: req.session.username}});
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


module.exports = router;
