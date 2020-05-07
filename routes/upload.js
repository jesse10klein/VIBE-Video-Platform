

const express = require('express')
const router = express.Router();
const path = require('path');
const fileUploader = require('express-fileupload');
router.use(fileUploader());

const db = require(path.join(__dirname, '../db'));
const { Video } = db.models;
const { Notifications } = db.models;
const { Subscriptions } = db.models;

//Require helper functions
var tools = require(path.join(__dirname, 'helperFunctions'));

//Require and use modules

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());


//FOR THING
var fs = require('fs');


//Form to upload a video
router.get('/', (req, res) => {

    if (req.session.username == null) {
      res.redirect('/users/login');
      return;
    }
  
    const fillInfo = {};
    const error = {};
    const username = req.session.username;

    res.render('uploadViews/upload', {username, fillInfo, error});
})

router.post('/handle-upload', tools.asyncHandler( async (req, res) => {

  console.log(req.get("content-length"));

  if (!req.files) {
    res.sendStatus(500);
    return;
  }

  const file = req.files.file1;
  const name = file.name;
  const uploadpath = path.join(__dirname, "../public/videos", file.name);


  file.mv(uploadpath, function(err) {
    if(err) {
        console.log("File Upload Failed", err);
        res.sendStatus(500);
        return;
    }
    else {
        console.log("File Uploaded", name);
        res.sendStatus(200);
        return;
    }
  });

}));

router.post('/post-upload', tools.asyncHandler( async (req, res) => {

  console.log(req.get("content-length"));

  const username = req.session.username;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const {title} = req.body;
  const {description} = req.body;
  const {tags} = req.body;
  const {videoURL} = req.body;

  //CHECK ALL IS VALID
  const dataCheck = tools.checkUploadData(title, description, tags);
  if ((dataCheck.length != 0)) {
    const error = tools.checkForErrors(dataCheck);
    res.send(error);
    return;
  }

  //If we get to here everything is fine
  //Create video and send video to user
  const video = await Video.create({
    uploader: username,
    title, description, tags, videoURL
  });

  //Need to notify all subscribers that the user has uploaded
  const subs = await Subscriptions.findAll({where: {user: username}});
  for (let i = 0; i < subs.length; i++) {
    await Notifications.create({
      user: username, 
      notificationType: "Upload", 
      recipient: subs[i].subscriber, 
      contentID: video.id
    });
  }
  
  res.send(video);

}));

module.exports = router;