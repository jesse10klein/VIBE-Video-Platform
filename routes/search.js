const express = require('express')
const router = express.Router();
const path = require('path');
const db = require(path.join(__dirname, '../db'));
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());


var tools = require(path.join(__dirname, 'helperFunctions'));


//GET ALL VIDEOS MADE BY THE USER
router.post('/', tools.asyncHandler( async (req, res) => {

    const { username } = req.session;
    const { searchTerm } = req.body;

    let videos = await Video.findAll();
    for (let i = 0; i < videos.length; i++) {
        videos[i].rating = tools.scoreVideo(searchTerm, videos[i]);
    }

    
    videos.sort((a, b) => (a.rating < b.rating) ? 1 : -1);
    for (let i = 0; i < videos.length; i++) {
        videos[i] = await tools.formatVideo(videos[i]);
        if (videos[i].rating < 100) {
            videos = videos.slice(0, i);
            break;
        }
    }

    if (videos.length == 0) {
        videos = null;
    }

    res.render("search", {videos, username, searchTerm});
}));

module.exports = router;