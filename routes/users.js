const express = require('express')
const router = express.Router();

const db = require('../db');
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;
const { videoVotes } = db.models;


const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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
  if (req.cookies.username) {
    res.redirect("/");
  } else {
    res.render('userViews/login');
  }
})

//Signup page
router.get('/signup', (req, res) => {
  res.render('userViews/signup');
})

//CHECK IF LOGIN MATCHES USER
router.post('/login', tools.asyncHandler(async (req, res) => {

  if (req.cookies.username) {
    res.redirect("/");
  }

  const match = await UserInfo.findOne({ 
	where: {
      username: req.body.username,
      password: req.body.password
		}
  });

  if (match) {
    res.cookie("username", match.username);
    res.redirect("/");
  } else {
    const error = "Incorrect username or password";
    res.render("userViews/login", {error});
  }

}));

router.get('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/');
})


//CREATE NEW USER BASED ON SIGN UP DATA
router.post('/signup', tools.asyncHandler(async (req, res) => {
  
    let { username } = req.body;
    let { email } = req.body;
    let { password } = req.body;
    const fill = { username, email }
    
    const error = await tools.signupErrors(username, email, password);

    if (!error) {
      user = await UserInfo.create({ username, password, email });
      res.render("userViews/newuser");
      return;
    } 
 
    res.render('userViews/signup', {error, fill});
}));


//GET ALL VIDEOS MADE BY THE USER
router.get('/:user', tools.asyncHandler(async (req, res) => {

  if (req.cookies.username == req.params.user) {
    res.redirect('/account');
  }

  const uploader = req.params.user;
  let videos = await Video.findAll({ where: { uploader } });
  if (videos.length == 0) {
      videos = null;
  }
  res.render("accountViews/account-home", {message: `${uploader}'s Videos:`, videos, username: uploader, notHomeUser: uploader});
}));

//GET ALL COMMENTS MADE BY THE USER
router.get('/:user/comments', tools.asyncHandler(async (req, res) => {

  const user = req.params.user;

  let comments = await Comments.findAll({ where: { user } });
  
  //Need to get each video the comment is on
  //COULD DO THIS BY JOINING, BUT CAN'T FIGURE OUT SO JUST LOOP
  for (let i = 0; i < comments.length; i++) {
      const video = await Video.findOne({where: {id: comments[i].videoID}});
      comments[i].video = video;
  }

  if (comments.length == 0) {
      comments = null;
  }

  res.render('accountViews/comments', {comments, username: user, message: "Comments", emptyMessage: "No comments yet", notHomeUser: user});
}));


//GET ALL VIDEOS UPVOTED BY THE USER
router.get('/:user/liked-videos', tools.asyncHandler(async (req, res) => {

  //GET UPVOTES
  const uploader = req.cookies.username;
  const notHomeUser = req.params.user;
  let videos = await userHelp.getVotes(notHomeUser, 1);

  if (videos.length == 0) {
      videos = null;
  }

  res.render("accountViews/account-home", {message: "Liked Videos", videos, username: uploader, emptyMessage: "No liked videos yet", notHomeUser});
}));

//GET ALL VIDEOS DOWNVOTED BY THE USER
router.get('/:user/disliked-videos', tools.asyncHandler(async (req, res) => {

  //GET DOWNVOTES
  const uploader = req.cookies.username;
  const notHomeUser = req.params.user;
  let videos = await userHelp.getVotes(notHomeUser, 2);

  if (videos.length == 0) {
      videos = null;
  }

  res.render("accountViews/account-home", {message: "Disliked Videos", videos, username: uploader, emptyMessage: "No disliked videos yet", notHomeUser});
}));

//GET ALL SUBSCRIBERS
router.get('/:user/subscribers', tools.asyncHandler(async (req, res) => {

  //GET SUBSCRIBERS
  const uploader = req.cookies.username;
  const notHomeUser = req.params.user;
  const subs = await userHelp.getSubs(notHomeUser, 1);

  res.render("accountViews/subscribe", {message: "Subscribers", emptyMessage: "No subscribers", subs, username: uploader, notHomeUser});
}));

//GET ALL SUBSCRIBED TO
router.get('/:user/subscribed-to', tools.asyncHandler(async (req, res) => {

  //GET SUBSCRIBERS
  const uploader = req.cookies.username;
  const notHomeUser = req.params.user;
  const subs = await userHelp.getSubs(notHomeUser, 2);

  res.render("accountViews/subscribe", {message: "Subscribed to", emptyMessage: "Not subscribed to anyone", subs, username: uploader, notHomeUser});
}));

//GET ALL BOOKMARKS
router.get('/:user/bookmarked-videos', tools.asyncHandler(async (req, res) => {

  const username = req.cookies.username
  const notHomeUser = req.params.user;

  if (username == null) {
      res.redirect('/');
  }

  res.render("accountViews/bookmarks", {message: "BOOKMARKS NOT IMPLEMENTED YET", username, notHomeUser});
}));


module.exports = router;