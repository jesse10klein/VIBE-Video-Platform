const express = require('express')
const router = express.Router();

const db = require('../db');
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;

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
    console.log("HERE");
    res.render("accountViews/account-home");
});

///////SOME ROUTES FOR LATER

//GET ALL COMMENTS MADE BY A USER
router.get('/comments', asyncHandler((req, res) => {

    if (req.cookies.username == null) {
        res.redirect('/');
    }

    const user = req.cookies.username;
    const comments = await Comments.findAll({ where: { user } });

    //res.render('SOMETHING', comments, user)

}));

//GET ALL VIDEOS MADE BY A USER
router.get('/videos', asyncHandler((req, res) => {

    if (req.cookies.username == null) {
        res.redirect('/');
    }

    const user = req.cookies.username;
    const videos = await Video.findAll({ where: { user } });

    //res.render('SOMETHING', comments, user)
     

}));


//Group comment and video information together
router.get('/group', asyncHandler((req, res) => {

    if (req.cookies.username == null) {
        res.redirect('/');
    }

    //Initialise list of comment/video
    let group = [];

    const user = req.cookies.username;
    const comments = await Comment.findAll({ where: { user } });

    for (comment in comments) {
        const video = await Video.findOne({where: {id: comment.videoID}});
        group.push({user, video});
    }

    //res.render('SOMETHING', comments, user)
     

}));


//Handle deleting a video
router.get('/:id/deletevideo', asyncHandler((req, res) => {
    //Get all comments assocaited with video and delete, then delete video entry

    const video = await Video.findOne({where: {id: req.params.id}});

    const comments = await Comments.findAll({where: {videoID = req.params.id}});

    //Delete these
    await comments.destroy();
    await video.destroy();
    res.send("Video deleted");

}));
/*
//Handle deleting a user
router.get('/deleteuser', asyncHandler((req, res) => {

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
        opOR []//sub or user 
    });
    await subscriptions.destroy();

    const user = await UserInfo.findOne({where: {username}});
    await user.destroy();

    res.send("All user info has been destroyed");

}));
*/




module.exports = router;