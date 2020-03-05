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

function asyncHandler(cb) {
    return async(req, res, next) => {
      try {
        await cb(req, res, next);
      } catch(error) {
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

    const video = await Video.findByPk(req.params.id);
    const {username} = req.cookies;
    const comments = await Comments.findAll({ 
        order: [["createdAt", "DESC"]],
        where: { videoID: req.params.id }
    });
    const uploader = await UserInfo.findOne({
      where: {username: video.uploader}
    })
    //Check if user is subscribed to the uploader
    const subscription = await Subscriptions.findOne({
      where: {user: uploader.username, subscriber: username}
    })
    const subscribed = !(subscription == null);
    res.render("videoViews/video-specific", {video, comments, uploader, username, subscribed});
}));

//Subscribe to a user
router.get('/:videoID/subscribe', asyncHandler(async (req, res) => {
  const video = await Video.findByPk(req.params.videoID);
  const user = video.uploader;

  const uploader = await UserInfo.findOne({where: { username: user }})
  const newSubCount = uploader.subscriberCount + 1;
  await uploader.update({ subscriberCount: newSubCount });

  //Make sure user is logged in
  if (req.cookies.username == null) {
      res.send("You must login before you can subscribe to someone");
  }

  const subscriber = req.cookies.username;
  await Subscriptions.create({ user, subscriber });
  res.redirect(`/video/${req.params.videoID}`);
}));

//Unsubscribe from a user
router.get('/:videoID/unsubscribe', asyncHandler(async (req, res) => {
  const video = await Video.findByPk(req.params.videoID);
  const user = video.uploader;

  const uploader = await UserInfo.findOne({where: { username: user }})
  const newSubCount = uploader.subscriberCount - 1;
  await uploader.update({ subscriberCount: newSubCount });

  //Make sure user is logged in
  if (req.cookies.username == null) {
      res.send("You must login before you can unsubscribe to someone");
  }
  const subscriber = req.cookies.username;

  const subscription = await Subscriptions.findOne({
    where: { user, subscriber }
  })
  if (!(subscription == null)) {
    await subscription.destroy();
  }
  res.redirect(`/video/${req.params.videoID}`);
}));


module.exports = router;
