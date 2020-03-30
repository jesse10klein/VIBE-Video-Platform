const express = require('express')
const router = express.Router();

const db = require('../db');
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;

const Sequelize = require('sequelize');
const Op = Sequelize.Op

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());


//Require helper functions
var tools = require('./helperFunctions');
var userHelp = require('./userInfoHelpers');

//GET ALL VIDEOS MADE BY THE USER
router.get('/', tools.asyncHandler(async (req, res) => {

    if (req.cookies.username == null) {
        res.redirect('/');
    }

    const uploader = req.cookies.username;
    let videos = await Video.findAll({ where: { uploader } });

    if (videos.length == 0) {
        videos = null;
    }

    res.render("accountViews/account-home", {message: "Your videos", videos, username: uploader});
}));

//GET ALL COMMENTS MADE BY THE USER
router.get('/comments', tools.asyncHandler(async (req, res) => {


    const user = req.cookies.username;

    if (user == null) {
        res.redirect('/');
    }

    let comments = await Comments.findAll({ where: { user } });
    console.log(comments);
    
    //Need to get each video the comment is on
    //COULD DO THIS BY JOINING, BUT CAN'T FIGURE OUT SO JUST LOOP
    for (let i = 0; i < comments.length; i++) {
        const video = await Video.findOne({where: {id: comments[i].videoID}});
        comments[i].video = video;
    }

    if (comments.length == 0) {
        comments = null;
    }

    res.render('accountViews/comments', {comments, username: user, message: "Comments", emptyMessage: "No comments yet"});
}));


//GET ALL VIDEOS UPVOTED BY THE USER
router.get('/liked-videos', tools.asyncHandler(async (req, res) => {

    if (req.cookies.username == null) {
        res.redirect('/');
    }

    //GET UPVOTES
    const uploader = req.cookies.username;
    let videos = await userHelp.getVotes(uploader, 1);

    if (videos.length == 0) {
        videos = null;
    }

    res.render("accountViews/account-home", {message: "Liked Videos", videos, username: uploader, emptyMessage: "No liked videos yet"});
}));

//GET ALL VIDEOS DOWNVOTED BY THE USER
router.get('/disliked-videos', tools.asyncHandler(async (req, res) => {

    if (req.cookies.username == null) {
        res.redirect('/');
    }

    //GET DOWNVOTES
    const uploader = req.cookies.username;
    let videos = await userHelp.getVotes(uploader, 2);

    if (videos.length == 0) {
        videos = null;
    }

    res.render("accountViews/account-home", {message: "Disliked Videos", videos, username: uploader, emptyMessage: "No disliked videos yet"});
}));

//GET ALL SUBSCRIBERS
router.get('/subscribers', tools.asyncHandler(async (req, res) => {

    if (req.cookies.username == null) {
        res.redirect('/');
    }

    //GET SUBSCRIBERS
    const uploader = req.cookies.username;
    const subs = await userHelp.getSubs(uploader, 1);

    res.render("accountViews/subscribe", {message: "Subscribers", emptyMessage: "No subscribers", subs, username: uploader});
}));

//GET ALL SUBSCRIBED TO
router.get('/subscribed-to', tools.asyncHandler(async (req, res) => {

    if (req.cookies.username == null) {
        res.redirect('/');
    }

    //GET SUBSCRIBERS
    const uploader = req.cookies.username;
    const subs = await userHelp.getSubs(uploader, 2);

    res.render("accountViews/subscribe", {message: "Subscribed to", emptyMessage: "Not subscribed to anyone", subs, username: uploader});
}));

//GET ALL BOOKMARKS
router.get('/bookmarked-videos', tools.asyncHandler(async (req, res) => {

    const username = req.cookies.username

    if (username == null) {
        res.redirect('/');
    }

    res.render("accountViews/bookmarks", {message: "BOOKMARKS NOT IMPLEMENTED YET", username});
}));

//Handle deleting a video
router.get('/:id/deletevideo', tools.asyncHandler(async (req, res) => {
    //Get all comments assocaited with video and delete, then delete video entry

    const video = await Video.findOne({where: {id: req.params.id}});

    const comments = await Comments.findAll({where: {videoID: req.params.id}});

    //Delete these
    await comments.destroy();
    await video.destroy();
    res.send("Video deleted");

}));

//Handle deleting a user
router.get('/deleteuser', tools.asyncHandler(async (req, res) => {

    const username = req.cookies.username;

    const videos = await Video.findAll({where: {uploader: username}});
    //Destroy all of the comments on each video
    for (video in videos) {
        const comments = await Comments.findAll({where: {videoID: video.id}});
        await comments.destroy();
    }
    //Destroy all videos
    await videos.destroy();

    //Now delete all comments made by user
    const comments = await Comments.findAll({where: {user: username}});
    await comments.destroy;

    //Now delete all subscriptions
    const subscriptions = await Subscriptions.findAll({
        where: {
            [Op.or]: {
                user: username,
                subscriber: username
            }
        }
    });
    await subscriptions.destroy();

    const user = await UserInfo.findOne({where: {username}});
    await user.destroy();

    res.send("All user info has been destroyed");

}));

module.exports = router;