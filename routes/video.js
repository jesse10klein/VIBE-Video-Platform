const express = require('express')
const router = express.Router();

const db = require('../db');
const { Videos } = db.models;
const { Comments } = db.models;

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

//Create new comment
router.post('/:id/add-comment', asyncHandler(async (req, res) => {

    if (req.cookies.username == null) {
        res.send("You must login to post a comment");
    }

    const comment = await Comments.create({
        user: req.cookies.username,
        videoID: req.params.id,
        comment: req.body.comment
    });

    res.redirect('/video/' + req.params.id);
}));


//Sorting comments under video
router.get('/:id', asyncHandler(async (req, res) => {

    const video = await Videos.findByPk(req.params.id);

    const comments = await Comments.findAll({ 
        order: [["createdAt", "DESC"]],
        where: { videoID: req.params.id }
    });

    res.render("video", {video, comments, username: req.cookies.username});
}));


module.exports = router;
