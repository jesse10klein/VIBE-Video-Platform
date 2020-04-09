

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
/**
 */
function uploadVideo(fileName) {

  const file = fileName;
  const name = file.name;

  var uploadpath = "../INFS3202/public/videos/" + name;

  file.mv(uploadpath, function(err){
    if(err){
      console.log("File Upload Failed",name,err);
    }
    else {
      console.log("File Uploaded",name);
    }
  });
}

router.post('/', tools.asyncHandler( async (req, res) => {

  const username = req.cookies.username;

  const {title} = req.body;
  const {description} = req.body;
  const {tags} = req.body;

  //CHECK ALL IS VALID
  const dataCheck = tools.checkUploadData(title, description, tags);
  if ((dataCheck.length != 0) || (!req.files) || (req.files.fileName.mimetype != 'video/mp4')) {
    const error = tools.checkForErrors(dataCheck, req.files);
    const fillInfo = {title, description, tags};

    res.render("uploadViews/upload", {username, fillInfo, error});
    return;
  }

  //ASSUME VIDEO IS UPLOADED FINE???
  uploadVideo(req.files.fileName);

  const now = new Date();
  const newVideo = await Video.create({
    uploader: req.cookies.username,
    title, 
    description, 
    videoURL: req.files.fileName.name,
    uploadDate: now.toISOString().slice(0, 10),
    tags
  });
  res.redirect("/video/" + newVideo.id);

}));

module.exports = router;