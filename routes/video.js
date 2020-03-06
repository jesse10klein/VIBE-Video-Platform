const express = require('express')
const router = express.Router();

const db = require('../db');
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());

function formatDay(day) {
  const ones = day % 10;
  let formatted = "" + day;
  switch (ones) {
      case 1:
          formatted += 'st';
          break;
      case 2: 
          formatted += 'nd';
          break;
      case 3:
          formatted += 'rd';
          break;
      default:
          formatted += 'th';
          break;
  }
  return formatted;
}

function formatDate(entry) {
  let formattedDate = "";
  var contents = entry.split('-');
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = months[parseInt(contents[1]) - 1];
  const day = formatDay(parseInt(contents[2]));
  const year = contents[0];
  formattedDate += day + " " + month + " " + year;
  return formattedDate;
}

function asyncHandler(cb) {
    return async(req, res, next) => {
      try {
        await cb(req, res, next);
      } catch(error) {
        console.log(error);
        res.status(500).send(error.message);
      }
    }
}

//Home VIDEO route
router.get('/', asyncHandler(async (req, res) => {

  const videos = await Video.findAll({ 
    order: [["uploadDate", "DESC"]]
  });

  const username = req.cookies.username;
  res.render("videoViews/video", {videos, username});
}));


//Create new comment
router.post('/:id/add-comment', asyncHandler(async (req, res) => {

    if (req.cookies.username == null) {
        res.send("You must login to post a comment");
    }

    const comment = await Comments.create({
        user: req.cookies.username,
        videoID: req.params.id,
        comment: req.body.comment
    });

    res.redirect('/video/' + req.params.id);
}));

//Form to upload a video
router.get('/upload', (req, res) => {

  if (req.cookies.username == null) {
    res.redirect('/');
  }

  const username = req.cookies.username;
  res.render('videoViews/upload', {username});
})

//Handle the uploading of a video/creating DB entry
router.post('/process-upload', asyncHandler(async (req, res) => {

  const now = new Date()

  video = await Video.create({
    uploader: req.cookies.username,
    title: req.body.title,
    tags: req.body.tags,
    description: req.body.description,
    videoURL: req.body.videoURL,
    uploadDate: now.toISOString().slice(0, 10)
  });

  res.send("Video Uploaded to Database");
}));

//Sorting comments under video
router.get('/:id', asyncHandler(async (req, res) => {
    
  let video = await Video.findByPk(req.params.id);

  const newViewCount = video.viewCount + 1;
  await video.update({ viewCount: newViewCount });

  const formattedDate = formatDate(video.uploadDate);
  const {username} = req.cookies;
  const comments = await Comments.findAll({ 
      order: [["createdAt", "DESC"]],
      where: { videoID: req.params.id }
  });
  const uploader = await UserInfo.findOne({
    where: {username: video.uploader}
  })

  //Check if user is subscribed to the uploader
  let subscribed = false;
  if (req.cookies.username) {
    const subscription = await Subscriptions.findOne({
      where: {user: uploader.username, subscriber: username}
    })
    subscribed = !(subscription == null);
  }
  res.render("videoViews/video-specific", {video, comments, uploader, username, subscribed, formattedDate});
}));

//Subscribe to a user
router.post('/:videoID/subscribe', asyncHandler(async (req, res) => {

  //Make sure user is logged in
  if (req.cookies.username == null) {
    return;
  }

  const video = await Video.findByPk(req.params.videoID);
  const user = video.uploader;

  const uploader = await UserInfo.findOne({where: { username: user }})
  const newSubCount = uploader.subscriberCount + 1;
  await uploader.update({ subscriberCount: newSubCount });

  const subscriber = req.cookies.username;
  await Subscriptions.create({ user, subscriber });
  return;
}));

//Unsubscribe from a user
router.post('/:videoID/unsubscribe', asyncHandler(async (req, res) => {

  console.log("Unsubscribe function");

  //Make sure user is logged in
  if (req.cookies.username == null) {
    return;
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
  return;
}));


module.exports = router;
