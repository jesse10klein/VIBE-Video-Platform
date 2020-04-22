const express = require('express')
const router = express.Router();
const path = require('path');
const db = require(path.join(__dirname, '../db'));
const { Video } = db.models;
const { Bookmarks } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());

const fileUploader = require('express-fileupload');
router.use(fileUploader());


//Require helper functions
var tools = require(path.join(__dirname, 'helperFunctions'));
var userHelp = require(path.join(__dirname, 'userInfoHelpers'));

//GET ALL VIDEOS MADE BY THE USER
router.get('/', tools.asyncHandler(async (req, res) => {

    if (req.session.username == null) {
        res.redirect('/');
    }

    const username = req.session.username;

    const user = await UserInfo.findOne({where:{username}});

    if (username == null) {
        res.send("You don't exist in the system.. wtf?");
        return;
    }

    res.render("accountViews/account-home", {username, user});
}));


//Handle deleting a video
router.get('/:id/deletevideo', tools.asyncHandler(async (req, res) => {
    //Get all comments assocaited with video and delete, then delete video entry

    const video = await Video.findOne({where: {id: req.params.id}});

    const comments = await Comments.findAll({where: {videoID: req.params.id}});

    //Delete these
    await comments.destroy();
    await video.destroy();
    res.send("Video deleted");

}));

//Handle deleting a video
router.get('/delete-video/:id', tools.asyncHandler(async (req, res) => {

    const video = await Video.findOne({where: {id: req.params.id}});
    if (video == null) {
        res.render("404", {message: "Could not find what you were looking for"});
        return;
    }

    await tools.deleteVideo(video);

    res.send("Your account has been successfully deleted");

}));

//Handle deleting a user
router.get('/delete-account', tools.asyncHandler(async (req, res) => {

    const user = await UserInfo.findOne({where: {username: req.session.username}});
    if (user == null) {
        res.render("404", {message: "Could not find what you were looking for"});
        return;
    }
    await tools.deleteAccount(user);
    res.clearCookie("username");
    res.redirect('/');
}));

router.get('/profile-picture', tools.asyncHandler(async (req, res) => {

    const { username } = req.session;
    if (username == null) {
        res.render("404", {message: "You need to be logged in"});
    }
    const user = await UserInfo.findOne({where: {username}});
    const imageURL = "/images/user-thumbs/" + user.imageURL;

    res.render("accountViews/profile-picture", {imageURL});
   
  }));

//Handle uploading a user's profile picture
router.post('/upload-pic', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.render("404", {message: "You need to be logged in"});
}

  if (!req.files) {
    const user = await UserInfo.findOne({where: {username}});
    const imageURL = "/images/user-thumbs/" + user.imageURL;
    const error = "Please select a file";
    res.render("accountViews/profile-picture", {imageURL, error});
    return
  } 

  const file = req.files.fileName

  if ((file.mimetype != "image/png") && (file.mimetype != "image/jpeg")) {
    const user = await UserInfo.findOne({where: {username}});
    const imageURL = "/images/user-thumbs/" + user.imageURL;
    const error = "File must be PNG or JPG";
    res.render("accountViews/profile-picture", {imageURL, error});
    return
  }

  const name = file.name;
  const user = await UserInfo.findOne({where: {username}});
  var uploadpath = "../INFS3202/public/images/user-thumbs/" + user.id + ".png";

  await user.update({imageURL: (user.id + ".png")});

  file.mv(uploadpath, function(err){
      if(err) {
          console.log("File Upload Failed", name, err);
      }
      else {
          console.log("File Uploaded", name);
      }
  });

  res.redirect("/account/profile-picture");
 
}));



module.exports = router;