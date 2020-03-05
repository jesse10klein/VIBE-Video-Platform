const express = require('express')
const router = express.Router();

const db = require('../db');
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;

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

    const comments = await Comments.findAll({ 
        order: [["createdAt", "DESC"]],
        where: { videoID: req.params.id }
    });

    let uploader = await UserInfo.findOne({
      where: {username: video.uploader}
    })

    const username = req.cookies.username;
    res.render("videoViews/video-specific", {video, comments, uploader, username});
}));


module.exports = router;
