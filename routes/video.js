const express = require('express')
const router = express.Router();

const db = require('../db');
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;
const { videoVotes } = db.models;

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

  const username = req.cookies.username;
  res.render("videoViews/video", {videos, username});
}));


//Create new comment
router.post('/:id/add-comment', tools.asyncHandler(async (req, res) => {

    //Check that the video exists
    const video = await Video.findOne({where: {id: req.params.id}});
    if (video == null) {
      res.render("404", {message: "The video that you have requested does not exist"});
    }

    if (req.cookies.username == null) {
        res.render("404", {message: "Resource not found"});
    }

    await Comments.create({
        user: req.cookies.username,
        videoID: req.params.id,
        comment: req.body.comment
    });

    res.status(204).send();
}));

//Form to upload a video
router.get('/upload', (req, res) => {

  if (req.cookies.username == null) {
    res.redirect('/login');
  }

  const username = req.cookies.username;
  res.render('videoViews/upload', {username});
})

//Handle the uploading of a video/creating DB entry
router.post('/process-upload', tools.asyncHandler(async (req, res) => {

  const now = new Date()

  video = await Video.create({
    uploader: req.cookies.username,
    title: req.body.title,
    tags: req.body.tags,
    description: req.body.description,
    videoURL: req.body.videoURL,
    uploadDate: now.toISOString().slice(0, 10)
  });

  res.redirect("/video/" + video.id);
}));

//Sorting comments under video
router.get('/:id', tools.asyncHandler(async (req, res) => {
    
  let video = await Video.findByPk(req.params.id);
  if (video == null) {
    res.render("404", {message: "The video you have requested does not exist"});
  }
  const newViewCount = video.viewCount + 1;
  await video.update({ viewCount: newViewCount });

  const uploader = await UserInfo.findOne({
    where: {username: video.uploader}
  })
  if (uploader == null) {
    res.render("404", { message: "The uploader of the referenced video has recently deleted their account" });
  }

  //Format date for video
  video.formattedDate = tools.formatDate(video.uploadDate);

  const {username} = req.cookies;
  const comments = await Comments.findAll({ 
      order: [["createdAt", "DESC"]],
      where: { videoID: req.params.id }
  });
  //Need to format date for comments
  for (let i = 0; i < comments.length; i++) {
    comments[i].formattedDate = tools.formatCommentDate(comments[i].createdAt);
  }

  //Check if user is subscribed to the uploader
  let subscribed = false;
  if (req.cookies.username) {
    const subscription = await Subscriptions.findOne({
      where: {user: uploader.username, subscriber: username}
    })
    subscribed = !(subscription == null);
  }
  res.render("videoViews/video-specific", {video, comments, uploader, username, subscribed});
}));

//Subscribe to a user
router.post('/:videoID/subscribe', tools.asyncHandler(async (req, res) => {

  //Make sure user is logged in
  if (req.cookies.username == null) {
    res.end();
  }

  const video = await Video.findByPk(req.params.videoID);
  const user = video.uploader;

  const uploader = await UserInfo.findOne({where: { username: user }})
  const newSubCount = uploader.subscriberCount + 1;
  await uploader.update({ subscriberCount: newSubCount });

  const subscriber = req.cookies.username;
  await Subscriptions.create({ user, subscriber });
  console.log("Subscribed");
  res.end();
}));

//Unsubscribe from a user
router.post('/:videoID/unsubscribe', tools.asyncHandler(async (req, res) => {

  //Make sure user is logged in
  if (req.cookies.username == null) {
    res.end();
  }

  const video = await Video.findByPk(req.params.videoID);
  const user = video.uploader;

  const uploader = await UserInfo.findOne({where: { username: user }})
  const newSubCount = uploader.subscriberCount - 1;
  await uploader.update({ subscriberCount: newSubCount });

  const subscriber = req.cookies.username;
  const subscription = await Subscriptions.findOne({
    where: { user, subscriber }
  })
  if (!(subscription == null)) {
    await subscription.destroy();
  }
  console.log("Unsubscribed");
  res.end();
}));

//Add upvote
router.post('/:videoID/addUpvote', tools.asyncHandler(async (req, res) => {

  //Make sure user is logged in
  if (!req.cookies.username) {
    res.status(202).send();
    return;
  }

  //Get the voting status of the user
  const vote = await videoVotes.findOne({
    where: {
      user: req.cookies.username, 
      videoID: req.params.videoID}
    });

  const video = await Video.findByPk(req.params.videoID);

  let alreadyVoted = false;

  //If user has video disliked, remove the vote
  if (vote && vote.status == 2) {
    await vote.destroy();
    const newDownvotes = video.downVotes - 1;
    video.update({upVotes: newDownvotes})
    alreadyVoted = true;
  }

  if (vote && vote.status == 1) {
    res.status(203).send();
    return;
  }

  //Add upvote to db
  const upVote = await videoVotes.create({
    videoID: req.params.videoID,
    user: req.cookies.username,
    status: 1
  });

  //Add vote to video
  const newUpvoteCount = video.upvotes + 1;
  await video.update({ upvotes: newUpvoteCount });
  if (alreadyVoted) {
    res.status(204).send();
    return;
  }
  res.end();
}));

//Add downvote
router.post('/:videoID/addDownvote', tools.asyncHandler(async (req, res) => {

  //Make sure user is logged in
  if (!req.cookies.username) {
    console.log("NO USERNAME");
    res.status(202).send();
    return;
  }

  const video = await Video.findByPk(req.params.videoID);

  //Get the voting status of the user
  const vote = await videoVotes.findOne({
    where: {
      user: req.cookies.username, 
      videoID: req.params.videoID}
    });
  
  let alreadyVoted = false;

  //If user has video liked, remove the vote
  if (vote && vote.status == 1) {
    await vote.destroy();
    const newUpvotes = video.upVotes - 1;
    video.update({upVotes: newUpvotes})
    alreadyVoted = true;
  }

  if (vote && vote.status == 2) {
    res.status(203).send();
    return;
  }

  //Add downvote to db
  const downVote = await videoVotes.create({
    videoID: req.params.videoID,
    user: req.cookies.username,
    status: 2
  });

  //Add vote to video
  const newDownvoteCount = video.downvotes + 1;
  await video.update({ downvotes: newDownvoteCount });
  if (alreadyVoted) {
    res.status(204).send();
    return;
  }
  res.end();
}));


module.exports = router;
