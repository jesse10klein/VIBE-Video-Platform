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

router.get('/account', (req, res) => {
  if (req.cookies.username != null) {
    res.send("Welcome to your account " + req.cookies.username);
  } else {
    res.redirect("/login");
  }
})

//CHECK IF LOGIN MATCHES USER
router.post('/login', asyncHandler(async (req, res) => {

  if (req.cookies.username) {
    console.log("Already signed in");
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
    _username = await UserInfo.findOne({
      where: {
        username: req.body.username
      }
    });

    _email = await UserInfo.findOne({
      where: {
        email: req.body.email
      }
    });

    if (_username == null || _email == null || _username.length == 0 || _email.length == 0) {
      user = await UserInfo.create({ username, password, email });
      res.render("userViews/newuser");
    } else {
      error =  "Username or Email already in use";
    } 
    res.render('userViews/signup', {error, fill});
}));



module.exports = router;