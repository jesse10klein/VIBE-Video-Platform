const express = require('express')
const router = express.Router();
const path = require('path');
const db = require(path.join(__dirname, '../db'));
const { Video } = db.models;
const { Bookmarks } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { passwordVerify } = db.models;

const bcrypt = require("bcrypt");
const validator = require("email-validator");

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
    user.formattedSubCount = tools.formatViews(user.subscriberCount);

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
  var uploadpath = path.join(__dirname, "../public/images/user-thumbs", (user.id + ".png"));

  await user.update({imageURL: (user.id + ".png")});

  file.mv(uploadpath, function(err){
      if(err) {
          console.log("File Upload Failed", name, err);
          res.redirect("/account/profile-picture");
      }
      else {
          console.log("File Uploaded", name);
          res.redirect("/account/profile-picture");
      }
  });
}));

//Get change email route
router.get('/change-email', tools.asyncHandler(async (req, res) => {
    const { username } = req.session;
    if (username == null) {
        res.redirect('/users/login');
        return;
    }

    res.render("accountViews/change-email", {username});
}))

//Handle changing a user's email
router.post('/change-email', tools.asyncHandler(async (req, res) => {

    const { username } = req.session;

    if (username == null) {
        res.redirect('/');
        return;
    }

    const { currentEmail, newEmail } = req.body;
    const fill = {currentEmail, newEmail};

    const user = await UserInfo.findOne({where: {username}});

    if (user.email != currentEmail) {
        res.render("accountViews/change-email", {error: "You entered your current email incorrectly", fill, username});
    }

    if (!validator.validate(newEmail)) {
        res.render("accountViews/change-email", {error: "The email you have entered is not valid", fill, username});
        return;
    }

    //Make sure email is not already in the system
    const emailTaken = await UserInfo.findOne({where: {email: newEmail}});
    if (emailTaken != null) {
        res.render("accountViews/change-email", {error: "That email is already registered in the system", fill, username});
        return;
    }

    //Here we can update email
    await user.update({email: newEmail, emailVerified: false});
    console.log("Email updated successfully");
    res.redirect('/');

}));

//Get change password route
router.get('/change-password', tools.asyncHandler(async (req, res) => {
    const { username } = req.session;
    if (username == null) {
        res.redirect('/users/login');
        return;
    }

    res.render("accountViews/change-password", {username});
}))

//Handle changing a user's password
router.post('/change-password', tools.asyncHandler(async (req, res) => {

    const { username } = req.session;
    if (username == null) {
        res.redirect('/');
        return;
    }

    const { currentPass, newPass, newPassDup } = req.body;
    
    const user = await UserInfo.findOne({where: {username}});
    if (!(await bcrypt.compare(currentPass, user.password))) {
        res.render("accountViews/change-password", {error: "You have entered your current password wrong", username});
        return;
    }

    if (newPass != newPassDup) {
        res.render("accountViews/change-password", {error: "The entered passwords do not match", username});
        return;
    }

    if (newPass.length <= 5) {
        res.render("accountViews/change-password", {error: "Your password must be at least 6 characters long", username});
        return;
    }

    //Use bcrypt to encrypt password 
    const hashedPassword = await bcrypt.hash(newPass, 10);

    await user.update({password: hashedPassword, emailVerified: false});
    res.redirect("/");
    return;
   
}));


//Handle verifying a user's email
router.get('/verify-email/:verifyID', tools.asyncHandler(async (req, res) => {

    const { username } = req.session;
    if (username == null) {
        res.send('Please login to the website and then click on your validation link again');
        return;
    }

    //Get user
    const user = await UserInfo.findOne({where: {username}});

    //Check the validation
    const valid = await passwordVerify.findOne({where: {
        username,
        varifyID: req.params.verifyID
    }})

    if (valid == null) {
        res.render("404", {message: "Couldn't find what you're looking for"});
    }

    //If we get here there is a valid verify request
    await user.update({emailVerified: true});
    await valid.destroy();
    res.redirect("/account");

}));


module.exports = router;