const express = require('express')
const router = express.Router();
const path = require('path');
const db = require(path.join(__dirname, '../db'));

const { Video } = db.models;
const { Bookmarks } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Subscriptions } = db.models;
const { videoVotes } = db.models;
const { commentVotes } = db.models;
const { Notifications } = db.models;
const { WatchParty } = db.models;

//Require helper functions
var tools = require(path.join(__dirname, 'helperFunctions'));

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());

//Default screen for creating a watch party
router.get('/', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const user = await UserInfo.findOne({where: {username}});

	res.render('watchTogether/create-room', { username, user });

}));

//Select a specific video for the watch party
router.get('/:id', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const user = await UserInfo.findOne({where: {username}});
  let video = await Video.findOne({where: {id: req.params.id}});
  video = await tools.formatVideo(video);

	res.render('watchTogether/create-room-video', { username, user, video });

}));

//Select the video to watch for the watch party
router.get('/select-video/:queryString', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const users = req.params.queryString.split("`");
  let partyUsers = [];
  for (let i = 0; i < users.length; i++) {
    const partyUser = await UserInfo.findOne({where: {username: users[i]}});
    partyUsers.push({imageURL: partyUser.imageURL, username: users[i]});
  }
  console.log(partyUsers);


  const user = await UserInfo.findOne({where: {username}});


	res.render('watchTogether/create-room', { username, user, partyUsers });

}));

//Create a new watch party session
router.post('/create-session', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const existing = await WatchParty.findOne({where: {host: username}});
  if (existing) {
    res.send({error: "You already have a watch party going on"});
    return;
  }

  const { userString } = req.body;
  const users = userString.split('`');
  if (users.length <= 1) {
    res.send({error: "You need to add at least one person to watch with"});
    return;
  }

  const joinLink = await tools.generatePartyJoinString()
  //Need to send this join link to everyone invited, excluding host

  for (let i = 0; i < users.length; i++) {
    if (users[i] == username) continue;
    await Notifications.create({
      recipient: users[i],
      notificationType: "watchParty",
      user: username,
      contentID: joinLink,
      read: false 
    });

  }

  await WatchParty.create({host: username, joinLink, users: userString});
  res.sendStatus(200);

}));




module.exports = router;