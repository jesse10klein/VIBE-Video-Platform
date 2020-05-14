const express = require('express')
const router = express.Router();
const path = require('path');
const db = require(path.join(__dirname, '../db'));

const { Video } = db.models;
const { UserInfo } = db.models;
const { Notifications } = db.models;
const { WatchParty } = db.models;
const { PartyNotifications } = db.models;
const { PartyPing } = db.models;

//Require helper functions
var tools = require(path.join(__dirname, 'helperFunctions'));

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());

//Default screen for creating a watch party
/*
router.get('/', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const user = await UserInfo.findOne({where: {username}});

	res.render('watchTogether/create-room', { username, user });

}));
*/

//Display session ended message
router.get('/session-ended', (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect('/');
    return;
  }

  res.render("accountViews/verification-sent", {message: 'Your watch party has ended! Thanks for watching :)', username});
});

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

/*
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

  const user = await UserInfo.findOne({where: {username}});

	res.render('watchTogether/create-room', { username, user, partyUsers });

}));
*/

//Create a new watch party session
router.post('/create-session', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const existing = await WatchParty.findOne({where: {host: username}});
  if (existing) {
    res.send({error: "You already have a watch party going on", joinLink: existing.joinLink});
    return;
  }

  const { userString, videoID } = req.body;
  const users = userString.split('`');
  if (users.length <= 1) {
    res.send({error: "You need to add at least one person to watch with"});
    return;
  }

  const joinLink = await tools.generatePartyJoinString()
  //Need to send this join link to everyone invited, excluding host

  for (let i = 0; i < users.length; i++) {
    await Notifications.create({
      recipient: users[i],
      notificationType: "watchParty",
      user: username,
      contentID: joinLink,
      read: false 
    });

  }

  const createdParty = await WatchParty.create({host: username, joinLink, users: userString, videoID});
  //Create host ping
  await PartyPing.create({partyID: createdParty.id, user: "HOST", lastPing: new Date()});

  res.send({joinLink: createdParty.joinLink});

}));

//Load a session
router.get('/session/:sessionID', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const { sessionID } = req.params;

  const session = await WatchParty.findOne({where: {joinLink: sessionID}});

  if (!session) {
    res.render("404", {message: "The watch party you have requested has ended"});
    return;
  }

  const video = await Video.findOne({where: {id: session.videoID}});

  const users = session.users.split('`');

  let host = false;
  if (users[0] == username) {
    host = true;
  }

  res.render("watchTogether/watch-party", {username, host, video, sessionID});

}));

//Process information send from client
router.post('/session/:sessionID', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const { type, info } = req.body;
  const { sessionID } = req.params;

  const session = await WatchParty.findOne({where: {joinLink: sessionID}});

  await PartyNotifications.create({
    partyID: session.id,
    user: username,
    type, content: info
  })

  res.sendStatus(200);

}));

//Get new notifications for user in watch party
router.post('/session/:sessionID/poll-for-updates', tools.asyncHandler(async (req, res) => {

  //Get the last notification id from the user
  const { lastNotificationID } = req.body;

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }
  const party = await WatchParty.findOne({where: {joinLink: req.params.sessionID}});
  if (party == null) {
    res.send({end: true});
    return;
  }

  const host = party.host == username;

  //If host, update video status
  if (username == party.host) {
    await party.update({videoStatus: req.body.sync});
  }

  let sync = null;
  //Update the users ping
  const ping = await PartyPing.findOne({where: {user: username, partyID: party.id}});
  if (ping == null) {
    await PartyPing.create({partyID: party.id, user: username, lastPing: new Date()});
    sync = party.videoStatus;
    await PartyNotifications.create({partyID: party.id, user: username, type: 'joined', content: ""});
  } else {
    await ping.update({lastPing: new Date()});
  }

  //Check if it has been 10 seconds since checking users
  const hostPing = await PartyPing.findOne({where: {user: "HOST"}});
  const now = new Date();
  if((now - hostPing.lastPing) > 5000) {
    //Check to see if any users have disconnected
    const userPings = await PartyPing.findAll({where: {partyID: party.id}});
    for (let i = 0; i < userPings.length; i++) {
      if ((now - userPings[i].lastPing) > 5000) {
        if (userPings[i].user == "HOST") continue;
        await PartyNotifications.create({partyID: party.id, user: userPings[i].user, type: 'left', content: ""});
        if (party.host == userPings[i].user) {
          //Need to assign a new host
          if (userPings.length <= 2) {
            //If no one to assign it to, end session
            res.redirect(`/session/${party.joinLink}/end-session`);
            return;
          } else {
            for (user of userPings) {
              if (user.user != party.host && user.user != "HOST") {
                //Found a new host
                await party.update({host: user.user});
                await PartyNotifications.create({partyID: party.id, user: user.user, type: 'host', content: ""});
              }
            }
          }
        }
        await userPings[i].destroy();
      }
    }
    hostPing.update({lastPing: new Date()});
  }

  let partyNotifications = await PartyNotifications.findAll({
    where: {partyID: party.id}, 
    order: [["createdAt", "ASC"]],
  });

  //Get all new notifications
  for (let i = 0; i < partyNotifications.length; i++) {
    if (lastNotificationID == null) {
      break;
    }
    if (partyNotifications[i].id == lastNotificationID) {
      partyNotifications = partyNotifications.slice(i + 1);
      break;
    }
  }

  for (let i = 0; i < partyNotifications.length; i++) {
    partyNotifications[i] = await tools.formatPartyMessage(partyNotifications[i]);
  }

  res.send({notifications: partyNotifications, admin: party.host == username, sync, host});
  
}));

//Finish a session
router.get('/session/:sessionID/end-session', tools.asyncHandler( async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const { sessionID } = req.params;

  const session = await WatchParty.findOne({where: {joinLink: sessionID}});

  if (session == null) {
    res.render("404", {message: "That session has already ended or never existed"});
    return;
  }

  //Get everything and delete it
  const sessionMessages = await PartyNotifications.findAll({where: {partyID: session.id}});
  const sessionNotifications = await Notifications.findAll({where: {contentID: sessionID}});
  const pings = await PartyPing.findAll({where: {partyID: session.id}});
  for (let i = 0; i < sessionMessages.length; i++) {
    await sessionMessages[i].destroy();
  }
  for (let i = 0; i < sessionNotifications.length; i++) {
    await sessionNotifications[i].destroy();
  }
  for (let i = 0; i < pings.length; i++) {
    await pings[i].destroy();
  }
  await session.destroy();

  res.redirect('/watch-party/session-ended');

}));


module.exports = router;