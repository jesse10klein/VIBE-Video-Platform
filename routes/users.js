const express = require('express')
const router = express.Router();

const db = require('../db');
const { UserInfo } = db.models;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const validator = require("email-validator");

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
router.post('/login', asyncHandler(async (req, res) => {

  if (req.cookies.username) {
    res.redirect("/");
  }

  const match = await UserInfo.findOne({ 
	where: {
    username: req.body.username,
    password: req.body.password
		}
  });

  //Check if user is in the system
  try {
    const username = match.toJSON().username
    res.cookie("username", username);
    res.redirect("/");
  } catch(error) {
    res.send("Incorrect username or password");
  }

}));

router.get('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/');
})


//CREATE NEW USER BASED ON SIGN UP DATA
router.post('/signup', asyncHandler(async (req, res) => {
  
    let error = "";
    let { username } = req.body;
    let { email } = req.body;
    let { password } = req.body;
    const fill = { username, email }

    if (!validator.validate(email)) {
      error = "Your email is invalid";
    }    

    if (error != "") {
      res.render('userViews/signup', {error, fill});
    }

    //Make sure that username and email aren't taken
    _username = await UserInfo.findOne({ where: { username }});

    _email = await UserInfo.findOne({ where: { email }});

    if (_username == null && _email == null ) {
      user = await UserInfo.create({ username, password, email });
      res.render("userViews/newuser");
    } else {
      error =  "Username or Email already in use";
    } 
    res.render('userViews/signup', {error, fill});
}));



//Show a Users Page
router.get('/:username', asyncHandler(async (req, res) => {
  
  
//GET ALL VIDEOS FROM THIS USER
const videos = Videos.findAll({where: {uploader: req.params.username}});
if (videos.length == 0) videos = null
//GET ALL COMMENTS MADE BY THIS USER
const comments = Comments.findAll({where: {user: req.params.username}});
if (comments.length == 0) comments = null
//GET LIST OF PEOPLE SUBSCRIBED TO BY USER
const subscribedTo = Subscribers.findAll({where: {subscriber: req.params.username}});
if (subscribedTo.length == 0) subscribedTo = null
//GET LIST OF PEOPLE WHO SUBSCRIBE TO USER
const subscribers = Subscribers.findAll({where: {user: req.params.username}});
if (subscribers.length == 0) subscribers = null
//GET LIST OF ALL LIKED VIDEOS
const likedVideos = videoVotes.findAll({where: {user: req.params.username, status: 1}});
if (likedVideos.length == 0) likedVideos = null
//GET LIST OF ALL DISLIKED VIDEOS
const dislikedVideos = videoVotes.findAll({where: {user: req.params.username, status: 2}});
if (dislikedVideos.length == 0) dislikedVideos = null

res.render('user-page', {videos, comments, subscribedTo, subscribers, likedVideos, dislikedVideos});


}));




module.exports = router;