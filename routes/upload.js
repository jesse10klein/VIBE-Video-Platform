

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
  
    const username = req.cookies.username;
    res.render('uploadViews/upload', {username});
})
/**
 */
function uploadVideo(fileName) {

  const file = fileName;
  const name = file.name;
  const type = file.mimetype;
  var uploadpath = "../INFS3202/public/videos/" + name;

  if (type != "video/mp4") {
  }

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

  if (req.files.fileName) {

    //ASSUME VIDEO IS UPLOADED FINE???
    uploadVideo(req.files.fileName);

    const {title} = req.body;
    const {description} = req.body;
    const {tags} = req.body;
    const {videoURL} = req.files.fileName.name;

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
  }
  else {
    res.send("You must select a file to upload");
  };

}));

module.exports = router;