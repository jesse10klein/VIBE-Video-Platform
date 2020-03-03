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


//Get Routes
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);
const videoRoutes = require('./routes/video');
app.use('/video', videoRoutes);



//Set view engine and tell express where to look for views
app.use(express.static("public"));
app.set('views', './views');
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
app.use(cookieParser());


app.get('/', (req, res) => {
    console.log(req.cookies.username);
    res.render('index', {username: req.cookies.username});
});

function asyncHandler(cb) {
    return async(req, res, next) => {
      try {
        await cb(req, res, next);
      } catch(error) {
        res.status(500).send(error);
      }
    }
}

app.listen(3000);
console.log("Web server listening on port 3000");
