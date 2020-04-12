

const express = require('express')
const router = express.Router();

const fileUploader = require('express-fileupload');
router.use(fileUploader());

const db = require('../db');
const { Video } = db.models;

//Require helper functions
var tools = require('./helperFunctions');

//Require and use modules

var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());


//FOR THING
var fs = require('fs');


//Form to upload a video
router.get('/', (req, res) => {

    if (req.cookies.username == null) {
      res.redirect('/login');
    }
  
    const fillInfo = {};
    const error = {};
    const username = req.cookies.username;

    res.render('uploadViews/upload', {username, fillInfo, error});
})

router.post('/handle-upload', tools.asyncHandler( async (req, res) => {

  console.log("RECIEVED UPLOAD THINGO");

  if (!req.files) {
    res.sendStatus(500);
    return;
  }

  const file = req.files.file1;
  const name = file.name;
  const uploadpath = "../INFS3202/public/videos/" + file.name;


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

  const username = req.cookies.username;

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

  const now = new Date();

  const video = await Video.create({
    uploader: req.cookies.username,
    title, description, tags, videoURL,
    uploadDate: now.toISOString().slice(0, 10)
  });
  res.send(video);

}));

module.exports = router;