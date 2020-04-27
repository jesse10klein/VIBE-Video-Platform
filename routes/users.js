const express = require('express')
const router = express.Router();
const path = require('path');
const db = require(path.join(__dirname, '../db'));
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Bookmarks } = db.models;
const { passwordVerify} = db.models;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vibevideoservice@gmail.com',    
    pass: 'Ernas123'
  }
})

const bcrypt = require("bcrypt");

//Require helper functions
var tools = require(path.join(__dirname, 'helperFunctions'));
var userHelp = require(path.join(__dirname, 'userInfoHelpers'));

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());

router.get('/', (req, res) => {
  res.redirect('/');
})

router.get('/password-recovery', (req, res) => {
  
  const { username } = req.session;

  if (username != null) {
    res.redirect("/");
    return;
  }

  res.render('userViews/password-recovery', {username});
})

router.post('/reset-password', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;

  const { email } = req.body;

  const user = await UserInfo.findOne({where: {email}});
  
  if (user == null) {
    res.render("userViews/password-recovery", {error: "The email entered is not in the system", username});
    return;
  }

  const generatedID = await tools.generateRandomString();

  const mailOptions = tools.getMailOptions(user, `http://localhost:3000/users/password-recovery/${generatedID}`);
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      res.render("userViews/password-recovery", {error: `An error occurred. Please try again later \n Error: ${error}`, username});
      return;
    } else {
      //If there are any requests sitting there, delete them
      const existingRequests = passwordVerify.findAll({where: {username: user.username}});
      for (let i = 0; i < existingRequests.length; i++) {
        await existingRequests[i].destroy();
      }
      //Add new request
      await passwordVerify.create({username: user.username, verifyID: generatedID});
      res.render("userViews/recovery-sent", {email: user.email, username});
      return;
    }
  })

}))

//Login page
router.get('/login', (req, res) => {

  if (req.session.username) {
    res.redirect("/");
    return;
  }

  res.render('userViews/login');
})

//Signup page
router.get('/signup', (req, res) => {
  res.render('userViews/signup');
})

//CHECK IF LOGIN MATCHES USER
router.post('/login', tools.asyncHandler(async (req, res) => {

  const username = req.body.username;

  if (req.session.username) {
    res.redirect("/");
    return;
  }

  //Find user by username
  const match = await UserInfo.findOne({where: {username}});

  if (match) {

    //Get user password and compare using bcrypt
    if (await bcrypt.compare(req.body.password, match.password)) {
      res.cookie("username", match.username);
      req.session.username = match.username;
      req.session.save();
      res.redirect("/");
      return;
    }
  }

  const error = "Incorrect username or password";
  res.render("userViews/login", {error});

}));

//Log user out
router.get('/logout', (req, res) => {
  req.session.destroy( err => {
    res.clearCookie('sid');
    res.clearCookie('username');
    res.redirect('/users/login');
  });
})

//CREATE NEW USER BASED ON SIGN UP DATA
router.post('/signup', tools.asyncHandler(async (req, res) => {
  
    let { username, email, password, verifyPassword } = req.body;
    const fill = { username, email }
    
    let error = await tools.signupErrors(username, email, password, verifyPassword);
    if (!(error.username || error.email || error.password || error.passwordDup)) {
      error = null;
    }

    if (!error) {
      //Hash the password before creating
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await UserInfo.create({ username, password: hashedPassword, email });
      res.redirect("/users/login");
      return;
    } 
 
    res.render('userViews/signup', {error, fill});
}));

//GET ALL VIDEOS MADE BY THE USER
router.get('/:user', tools.asyncHandler(async (req, res) => {
  
  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  let videos = await Video.findAll({ where: { uploader: user.username } });
  if (videos.length == 0) {
      videos = null;
  }
  if (videos != null) {
    for (video of videos) {
      const user = await UserInfo.findOne({where: { username: video.uploader }});
      video.imageURL = user.imageURL;
      video.formattedViewCount = tools.formatViews(video.viewCount);
      video.timeSince = tools.formatTimeSince(video.createdAt);
    }
  }

  res.render("userProfile/user-home", {message: `${user.username}'s Videos:`, videos, user, username: req.session.username});
}));

//GET ALL VIDEOS UPVOTED BY THE USER
router.get('/:user/liked-videos', tools.asyncHandler(async (req, res) => {

  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  //GET UPVOTES
  let videos = await userHelp.getVotes(user.username, 1);
  if (videos != null) {
    for (video of videos) {
      const user = await UserInfo.findOne({where: { username: video.uploader }});
      video.imageURL = user.imageURL;
      video.formattedViewCount = tools.formatViews(video.viewCount);
      video.timeSince = tools.formatTimeSince(video.createdAt);
    }
  }
  if (videos.length == 0) {
      videos = null;
  }

  res.render("userProfile/user-home", {message: "Liked Videos", videos, emptyMessage: "No liked videos yet", user, username: req.session.username});
}));

//GET ALL VIDEOS DOWNVOTED BY THE USER
router.get('/:user/disliked-videos', tools.asyncHandler(async (req, res) => {

  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  //GET DOWNVOTES
  let videos = await userHelp.getVotes(user.username, 2);
  if (videos != null) {
    for (video of videos) {
      const user = await UserInfo.findOne({where: { username: video.uploader }});
      video.imageURL = user.imageURL;
      video.formattedViewCount = tools.formatViews(video.viewCount);
      video.timeSince = tools.formatTimeSince(video.createdAt);
    }
  }

  if (videos.length == 0) {
      videos = null;
  }

  res.render("userProfile/user-home", {message: "Disliked Videos", videos, emptyMessage: "No disliked videos yet", user, username: req.session.username});
}));

//GET ALL SUBSCRIBERS
router.get('/:user/subscribers', tools.asyncHandler(async (req, res) => {

  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  //GET SUBSCRIBERS
  const subs = await userHelp.getSubs(user.username, 1);

  res.render("userProfile/subscribe", {message: "Subscribers", emptyMessage: "No subscribers", subs, user, username: req.session.username});
}));

//GET ALL SUBSCRIBED TO
router.get('/:user/subscribed-to', tools.asyncHandler(async (req, res) => {

  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  //GET SUBSCRIBERS
  const subs = await userHelp.getSubs(user.username, 2);

  res.render("userProfile/subscribe", {message: "Subscribed to", emptyMessage: "Not subscribed to anyone", subs, user, username: req.session.username});
}));

//GET ALL BOOKMARKS
router.get('/:user/bookmarked-videos', tools.asyncHandler(async (req, res) => {

  //GET BOOKMARKED

  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  const bookmarks = await Bookmarks.findAll({where: {username: user.username}});

  let videos = [];
  for (let i = 0; i < bookmarks.length; i++) {
      //Find video corresponding to each bookmark
      const video = await Video.findOne({where: {
          id: bookmarks[i].videoID
      }});
      videos.push(video);
  }

  if (videos.length == 0) {
      videos = null;
  }

  res.render("userProfile/user-home", {message: "Bookmarked Videos", videos, emptyMessage: "No Bookmarked Videos Yet", user, username: req.session.username});
}));

//GET Requested password reset
router.get('/password-recovery/:verifyID', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username != null) {
    res.redirect("/");
    return;
  }

  const match = await passwordVerify.findOne({where: {verifyID: req.params.verifyID}});
  if (match == null) {
    res.redirect('/');
    return;
  }

  res.render("userViews/recovery-submit.pug", {recoveryUsername: match.username , username});

}));

//Reset password for user
router.post('/password-recovery/:username', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username != null) {
    res.redirect("/");
    return;
  }

  const match = await passwordVerify.findOne({where: {username: req.params.username}});
  console.log(req.params.verifyID);
  if (match == null) {
    res.redirect('/');
    return;
  }
  const user = await UserInfo.findOne({where: {username: match.username}});

  const { newPass, newPassConfirm } = req.body;

  if (newPass != newPassConfirm) {
    res.render("userViews/recovery-submit.pug", {recoveryUsername: user.username , username, error: "The two passwords don't match"});
    return;
  }

  if (newPass.length <= 5) {
    res.render("userViews/recovery-submit.pug", {recoveryUsername: user.username , username, error: "Password must be at least 6 characters long"});
    return;
  }

  const hashedPassword = await bcrypt.hash(newPass, 10);
  await user.update({password: hashedPassword});
  await match.destroy();

  res.redirect("/users/login");

}));

module.exports = router;