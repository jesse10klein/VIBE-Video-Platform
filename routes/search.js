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


//GET ALL VIDEOS MADE BY THE USER
router.post('/', (req, res) => {
    res.send("SEARCHING HAS NOT YET BEEN IMPLEMENTS");
});

module.exports = router;