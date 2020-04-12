const express = require('express')
const router = express.Router();

const db = require('../db');
const { Video } = db.models;
const { Bookmarks } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());

const fileUploader = require('express-fileupload');
router.use(fileUploader());


//Require helper functions
var tools = require('./helperFunctions');
var userHelp = require('./userInfoHelpers');

//GET ALL VIDEOS MADE BY THE USER
router.get('/', tools.asyncHandler(async (req, res) => {

    if (req.session.username == null) {
        res.redirect('/');
    }

    const uploader = req.session.username;
    let videos = await Video.findAll({ where: { uploader } });

    if (videos.length == 0) {
        videos = null;
    }

    res.render("accountViews/account-home", {message: "Your videos", videos, username: uploader, myVids: true});
}));

//GET ALL COMMENTS MADE BY THE USER
router.get('/comments', tools.asyncHandler(async (req, res) => {

    const user = req.session.username;

    if (user == null) {
        res.redirect('/');
    }

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

    res.render('accountViews/comments', {comments, username: user, message: "Comments", emptyMessage: "No comments yet"});
}));


//GET ALL VIDEOS UPVOTED BY THE USER
router.get('/liked-videos', tools.asyncHandler(async (req, res) => {

    if (req.session.username == null) {
        res.redirect('/');
    }

    //GET UPVOTES
    const uploader = req.session.username;
    let videos = await userHelp.getVotes(uploader, 1);

    if (videos.length == 0) {
        videos = null;
    }

    res.render("accountViews/account-home", {message: "Liked Videos", videos, username: uploader, emptyMessage: "No liked videos yet"});
}));

//GET ALL VIDEOS DOWNVOTED BY THE USER
router.get('/disliked-videos', tools.asyncHandler(async (req, res) => {

    if (req.session.username == null) {
        res.redirect('/');
    }

    //GET DOWNVOTES
    const uploader = req.session.username;
    let videos = await userHelp.getVotes(uploader, 2);

    if (videos.length == 0) {
        videos = null;
    }

    res.render("accountViews/account-home", {message: "Disliked Videos", videos, username: uploader, emptyMessage: "No disliked videos yet"});
}));

//GET ALL SUBSCRIBERS
router.get('/subscribers', tools.asyncHandler(async (req, res) => {

    if (req.session.username == null) {
        res.redirect('/');
    }

    //GET SUBSCRIBERS
    const uploader = req.session.username;
    const subs = await userHelp.getSubs(uploader, 1);

    res.render("accountViews/subscribe", {message: "Subscribers", emptyMessage: "No subscribers", subs, username: uploader});
}));

//GET ALL SUBSCRIBED TO
router.get('/subscribed-to', tools.asyncHandler(async (req, res) => {

    if (req.session.username == null) {
        res.redirect('/');
    }

    //GET SUBSCRIBERS
    const uploader = req.session.username;
    const subs = await userHelp.getSubs(uploader, 2);

    res.render("accountViews/subscribe", {message: "Subscribed to", emptyMessage: "Not subscribed to anyone", subs, username: uploader});
}));

//GET ALL BOOKMARKS
router.get('/bookmarked-videos', tools.asyncHandler(async (req, res) => {

    if (req.session.username == null) {
        res.redirect('/');
    }

    //GET BOOKMARKED
    const uploader = req.session.username;

    const bookmarks = await Bookmarks.findAll({where: {username: uploader}});
    
    let videos = [];
    for (let i = 0; i < bookmarks.length; i++) {
        //Find video corresponding to each bookmark
        const video = await Video.findOne({where: {
            id: bookmarks[i].videoID
        }});
        videos.push(video);
    }

    if (videos.length == 0) {
        videos = null;
    }

    res.render("accountViews/account-home", {message: "Bookmarked Videos", videos, username: uploader, emptyMessage: "No Bookmarked Videos Yet"});
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

//Handle deleting a comment
router.post('/comments/delete-comment/:id', tools.asyncHandler(async (req, res) => {
    const comment = await Comments.findOne({where: {
        id: req.params.id,
        user: req.session.username
      }});
      if (comment == null) {
          res.render("404", {message: "Could not find what you were looking for"});
          return;
      }
    
      await comment.destroy();
      res.send("Comment deleted");
}));


//Handle deleting a video
router.get('/delete-video/:id', tools.asyncHandler(async (req, res) => {

    const video = await Video.findOne({where: {id: req.params.id}});
    if (video == null) {
        res.render("404", {message: "Could not find what you were looking for"});
        return;
    }

    await tools.deleteVideo(video);

    res.send("Your account has been successfully deleted");

}));



//Handle deleting a user
router.get('/delete-account', tools.asyncHandler(async (req, res) => {

    const user = await UserInfo.findOne({where: {username: req.session.username}});
    if (user == null) {
        res.render("404", {message: "Could not find what you were looking for"});
        return;
    }
    await tools.deleteAccount(user);
    res.clearCookie("username");
    res.redirect('/');
}));

router.get('/profile-picture', (req, res) => {
    res.render("accountViews/profile-picture");
})

//Handle uploading a user's profile picture
router.post('/upload-pic', tools.asyncHandler(async (req, res) => {

   
  const username = req.session.username;


  if (!req.files) {
      res.send("you must select a file");
  } 

  const file = req.files.fileName

  if ((file.mimetype != "image/png") && (file.mimetype != "image/jpeg")) {
      res.send("Please select a png or jpg file");
      return
  }


  const name = file.name;

  const user = await UserInfo.findOne({where: {username}});


  var uploadpath = "../INFS3202/public/images/user-thumbs/" + user.id + ".png";

  await user.update({imageURL: (user.id + ".png")});


  file.mv(uploadpath, function(err){
      if(err) {
          console.log("File Upload Failed", name, err);
      }
      else {
          console.log("File Uploaded", name);
      }
  });

  res.send("uploaded");
 
}));



module.exports = router;