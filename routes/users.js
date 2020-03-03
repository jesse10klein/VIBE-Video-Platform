const express = require('express')
const router = express.Router();

const db = require('../db');
const { UserInfo } = db.models;



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
  res.cookie("username", "CrashingSwine05");
  res.send("Cookie Set");
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
router.post('/login-check', asyncHandler(async (req, res) => {

  if (req.cookies.username) {
    console.log("Already signed in");
    res.redirect("/");
  }

  const user = await UserInfo.findAll({ 
	where: {
    username: req.body.username,
    password: req.body.password
		}
  });

  //Check if user is in the system
  const match = user[0];
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
router.post('/process-signup', asyncHandler(async (req, res) => {
    user = await UserInfo.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
        
    })
    res.send("USER CREATED");
}));



module.exports = router;