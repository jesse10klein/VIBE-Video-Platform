const db = require('./db');

//Try to sync database
async function setUp() {
    try {
        await db.sequelize.sync();
    } catch (error) {
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
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);
const videoRoutes = require('./routes/video');
app.use('/video', videoRoutes);
const accountRoutes = require('./routes/account');
app.use('/account', accountRoutes);
const uploadRoutes = require('./routes/upload');
app.use('/upload', uploadRoutes);
const searchRoutes = require('./routes/search');
app.use('/search', searchRoutes);

//Set view engine and tell express where to look for views
app.use(express.static("public"));
app.set('views', './views');
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.get('/', (req, res) => {
    res.redirect('video');
});

app.get('*', (req, res) => {
  res.render("404", {message: "You have requested an invalid route"});
});

app.listen(3000);
console.log("Web server listening on port 3000");
