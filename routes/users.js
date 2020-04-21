const express = require('express')
const router = express.Router();

const db = require('../db');
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Bookmarks } = db.models;

const bcrypt = require("bcrypt");


//Require helper functions
var tools = require('./helperFunctions');
var userHelp = require('./userInfoHelpers');

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());

router.get('/', (req, res) => {
  res.redirect('/');
})

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
  
    let { username, email, password } = req.body;
    const fill = { username, email }
    
    let error = await tools.signupErrors(username, email, password);
    if (!(error.username || error.email || error.password)) {
      error = null;
    }

    if (!error) {
      //Hash the password before creating
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await UserInfo.create({ username, password: hashedPassword, email });
      res.render("userViews/newuser");
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


module.exports = router;