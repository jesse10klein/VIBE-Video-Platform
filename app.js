
const path = require('path')

const db = require(path.join(__dirname, 'db'));

//Need to use bcrypt
const bcrypt = require('bcrypt');

//Try to sync database
async function setUp() {
    try {
        await db.sequelize.sync({force: false});
    } catch (error) {
      console.log(error);
        console.log("Database unable to be synced");
    }
};
setUp();


const express = require("express");
const pug = require("pug");
const app = express();
var bodyParser = require('body-parser');

const expressSession = require("express-session");

const sessionName = 'sid';
app.use(expressSession({
  name: sessionName,
  cookie: {
    maxAge: (1000 * 60 * 60),
    sameSite: true,
    secure: false
  },
  secret: 'isthisthingon?', 
  saveUninitialized: true, 
  resave: false
}));

//Get Routes
const userRoutes = require(path.join(__dirname, 'routes/users'));
app.use('/users', userRoutes);
const videoRoutes = require(path.join(__dirname, 'routes/video'));
app.use('/video', videoRoutes);
const accountRoutes = require(path.join(__dirname, 'routes/account'));
app.use('/account', accountRoutes);
const uploadRoutes = require(path.join(__dirname, 'routes/upload'));
app.use('/upload', uploadRoutes);
const searchRoutes = require(path.join(__dirname, 'routes/search'));
app.use('/search', searchRoutes);
const messageRoutes = require(path.join(__dirname, 'routes/messages'));
app.use('/messages', messageRoutes);
const watchTogetherRoutes = require(path.join(__dirname, 'routes/watchTogether'));
app.use('/watch-party', watchTogetherRoutes);

//Set view engine and tell express where to look for views
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.use((req, res, next) => {
  if (!req.session.username) {
    if (req.cookies.username) {
      res.clearCookie("username");
      console.log("Login cookie cleared");
    }  
  } else {
    if (!req.cookies.username) {
      res.cookie("username", req.session.username);
    }
  }
  next();
});


app.get('/', async (req, res) => {
  // if (!req.session.username) {
  //   req.session.username = "Joji";
  //   res.cookie("username", "Joji");
  //   req.session.save();
  // }
  res.redirect('video');
});

app.get('*', (req, res) => {
  res.render("404", {message: "You have requested an invalid route"});
});

const port = 8081; //Has to be this for nginx

app.set('trust proxy', 'loopback');

app.listen(port);
console.log( `Web server listening on port ${port}`);
