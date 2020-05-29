const express = require('express')
const router = express.Router();
const path = require('path');
const db = require(path.join(__dirname, '../db'));
const { Video } = db.models;
const { Comments } = db.models;
const { UserInfo } = db.models;
const { Bookmarks } = db.models;
const { passwordVerify } = db.models;
const { Notifications } = db.models;
const { Subscriptions } = db.models;
const { Message } = db.models;

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: 'mailhub.eait.eq.edu.au',
  port: 25
});

const bcrypt = require("bcrypt");

//Require helper functions
var tools = require(path.join(__dirname, 'helperFunctions'));
var userHelp = require(path.join(__dirname, 'userInfoHelpers'));

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());

router.get('/', (req, res) => {
  res.redirect('/');
})

router.get('/password-recovery', (req, res) => {
  
  const { username } = req.session;

  if (username != null) {
    res.redirect("/");
    return;
  }

  res.render('userViews/password-recovery', {username});
})

router.post('/reset-password', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;

  const { email } = req.body;

  const user = await UserInfo.findOne({where: {email}});
  
  var URL = req.protocol + '://' + req.get('host');

  if (user == null) {
    res.render("userViews/password-recovery", {error: "The email entered is not in the system", username});
    return;
  }

  const generatedID = await tools.generateRandomString();

  const mailOptions = tools.getMailOptions(user, `${URL}/users/password-recovery/${generatedID}`);
  transporter.sendMail(mailOptions, async (error, info) => {
    if (error) {
      res.render("userViews/password-recovery", {error: `An error occurred. Please try again later \n Error: ${error}`, username});
      return;
    } else {
      //If there are any requests sitting there, delete them
      const existingRequests = passwordVerify.findAll({where: {username: user.username, type: "password"}});
      for (let i = 0; i < existingRequests.length; i++) {
        await existingRequests[i].destroy();
      }
      //Add new request
      await passwordVerify.create({username: user.username, verifyID: generatedID, type: "password"});
      res.render("userViews/recovery-sent", {email: user.email, username});
      return;
    }
  })

}))

//Login page
router.get('/login', (req, res) => {

  if (req.session.username) {
    res.redirect("/");
    return;
  }

  res.render('userViews/login');
})

//Signup page
router.get('/signup', (req, res) => {
  res.render('userViews/signup');
})

//CHECK IF LOGIN MATCHES USER
router.post('/login', tools.asyncHandler(async (req, res) => {

  const username = req.body.username;

  if (req.session.username) {
    res.redirect("/");
    return;
  }

  //Find user by username
  const match = await UserInfo.findOne({where: {username}});

  if (match) {

    //Get user password and compare using bcrypt
    if (await bcrypt.compare(req.body.password, match.password)) {
      res.cookie("username", match.username);
      req.session.username = match.username;
      req.session.save();
      res.redirect("/");
      return;
    }
  }

  const error = "Incorrect username or password";
  res.render("userViews/login", {fill: username, error});

}));

//Log user out
router.get('/logout', (req, res) => {
  req.session.destroy( err => {
    res.clearCookie('sid');
    res.clearCookie('username');
    res.redirect('/users/login');
  });
})

//CREATE NEW USER BASED ON SIGN UP DATA
router.post('/signup', tools.asyncHandler(async (req, res) => {
  
    let { username, email, password, verifyPassword } = req.body;
    const fill = { username, email }
    
    let error = await tools.signupErrors(username, email, password, verifyPassword);
    if (!(error.username || error.email || error.password || error.passwordDup)) {
      error = null;
    }

    if (!error) {
      //Hash the password before creating
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await UserInfo.create({ username, password: hashedPassword, email });
      const message = `Welcome to Vibe Videos ${username}!\n\n We hope you enjoy your stay :)`
      await Message.create({message, sender: "CrashingSwine05", recipient: username, read: false});
      res.redirect("/users/login");
      return;
    } 
 
    res.render('userViews/signup', {error, fill});
}));

//GET ALL VIDEOS MADE BY THE USER
router.get('/:user', tools.asyncHandler(async (req, res) => {
  
  const { username } = req.session;

  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  let videos = await Video.findAll({ where: { uploader: user.username } });
  if (videos.length == 0) {
      videos = null;
  }
  for (let i = 0; i < videos.length; i++) {
    videos[i] = await tools.formatVideo(videos[i]);
  }

  let subscribed = false;
  if (username != null) {
    const subscription = await Subscriptions.findOne({where: {subscriber: username, user: req.params.user}});
    subscribed = !(subscription == null);
  }

  res.render("userProfile/user-home", {subscribed, message: `${user.username}'s Videos:`, videos, user, username: req.session.username});
}));

//GET ALL VIDEOS UPVOTED BY THE USER
router.get('/:user/liked-videos', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;

  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  //GET UPVOTES
  let videos = await userHelp.getVotes(user.username, 1);
  for (let i = 0; i < videos.length; i++) {
    videos[i] = await tools.formatVideo(videos[i]);
  }

  if (videos.length == 0) {
      videos = null;
  }

  let subscribed = false;
  if (username != null) {
    const subscription = await Subscriptions.findOne({where: {subscriber: username, user: req.params.user}});
    subscribed = !(subscription == null);
  }

  res.render("userProfile/user-home", {subscribed, message: "Liked Videos", videos, emptyMessage: "No liked videos yet", user, username: req.session.username});
}));

//GET ALL VIDEOS DOWNVOTED BY THE USER
router.get('/:user/disliked-videos', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;

  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  //GET DOWNVOTES
  let videos = await userHelp.getVotes(user.username, 2);

  for (let i = 0; i < videos.length; i++) {
    videos[i] = await tools.formatVideo(videos[i]);
  }


  if (videos.length == 0) {
      videos = null;
  }

  let subscribed = false;
  if (username != null) {
    const subscription = await Subscriptions.findOne({where: {subscriber: username, user: req.params.user}});
    subscribed = !(subscription == null);
  }

  res.render("userProfile/user-home", {subscribed, message: "Disliked Videos", videos, emptyMessage: "No disliked videos yet", user, username: req.session.username});
}));

//GET ALL SUBSCRIBERS
router.get('/:user/subscribers', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;

  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  //GET SUBSCRIBERS
  const subs = await userHelp.getSubs(user.username, 1);

  let subscribed = false;
  if (username != null) {
    const subscription = await Subscriptions.findOne({where: {subscriber: username, user: req.params.user}});
    subscribed = !(subscription == null);
  }

  res.render("userProfile/subscribe", {subscribed, message: "Subscribers", emptyMessage: "No subscribers", subs, user, username: req.session.username});
}));

//GET ALL SUBSCRIBED TO
router.get('/:user/subscribed-to', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;

  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  //GET SUBSCRIBERS
  const subs = await userHelp.getSubs(user.username, 2);

  let subscribed = false;
  if (username != null) {
    const subscription = await Subscriptions.findOne({where: {subscriber: username, user: req.params.user}});
    subscribed = !(subscription == null);
  }

  res.render("userProfile/subscribe", {subscribed, message: "Subscribed to", emptyMessage: "Not subscribed to anyone", subs, user, username: req.session.username});
}));

//GET ALL BOOKMARKS
router.get('/:user/bookmarked-videos', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;

  //GET BOOKMARKED
  const user = await UserInfo.findOne({where: {username: req.params.user}});
  if (user == null) {
    res.render('404', {message: "That user does not exist"})
  }
  user.formattedSubCount = tools.formatViews(user.subscriberCount);

  const bookmarks = await Bookmarks.findAll({where: {username: user.username}});

  let videos = [];
  for (let i = 0; i < bookmarks.length; i++) {
      //Find video corresponding to each bookmark
      let video = await Video.findOne({where: {
          id: bookmarks[i].videoID
      }});
      video = await tools.formatVideo(video);
      videos.push(video);
  }

  if (videos.length == 0) {
      videos = null;
  }

  let subscribed = false;
  if (username != null) {
    const subscription = await Subscriptions.findOne({where: {subscriber: username, user: req.params.user}});
    subscribed = !(subscription == null);
  }

  res.render("userProfile/user-home", {subscribed, message: "Bookmarked Videos", videos, emptyMessage: "No Bookmarked Videos Yet", user, username: req.session.username});
}));

//GET Requested password reset
router.get('/password-recovery/:verifyID', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username != null) {
    res.redirect("/");
    return;
  }

  const match = await passwordVerify.findOne({where: {verifyID: req.params.verifyID}});
  if (match == null) {
    res.redirect('/');
    return;
  }

  res.render("userViews/recovery-submit.pug", {recoveryUsername: match.username , username});

}));

//Reset password for user
router.post('/password-recovery/:username', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username != null) {
    res.redirect("/");
    return;
  }

  const match = await passwordVerify.findOne({where: {username: req.params.username}});
  if (match == null) {
    res.redirect('/');
    return;
  }
  const user = await UserInfo.findOne({where: {username: match.username}});

  const { newPass, newPassConfirm } = req.body;

  if (newPass != newPassConfirm) {
    res.render("userViews/recovery-submit.pug", {recoveryUsername: user.username , username, error: "The two passwords don't match"});
    return;
  }

  if (newPass.length <= 5) {
    res.render("userViews/recovery-submit.pug", {recoveryUsername: user.username , username, error: "Password must be at least 6 characters long"});
    return;
  }

  const hashedPassword = await bcrypt.hash(newPass, 10);
  await user.update({password: hashedPassword});
  await match.destroy();

  res.redirect("/users/login");

}));

//Fetch notifications for user
router.post('/fetch-notifications', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("users/login");
    return;
  }

  const userNotifications = await Notifications.findAll({
    order: [["createdAt", "DESC"]],
    where: {recipient: username
  }});
  const notifications = [];

  //Provide more info for some notification types
  //Need to reformat cause stupid sequelize
  for (let i = 0; i < userNotifications.length; i++) {
    const user = await UserInfo.findOne({where: {username: userNotifications[i].user}});
    if (userNotifications[i].notificationType == "watchParty") {
      const notif = {
        read: userNotifications[i].read,
        id: userNotifications[i].id,
        recipient: userNotifications[i].recipient,
        notificationType: userNotifications[i].notificationType,
        user: userNotifications[i].user,
        contentID: userNotifications[i].contentID,
        imageURL: user.imageURL
      }
      notifications.push(notif);
    } else if (userNotifications[i].notificationType != "Subscribe") {
      const video = await Video.findOne({where: {id: userNotifications[i].contentID}});
      const notif = {
        read: userNotifications[i].read,
        id: userNotifications[i].id,
        recipient: userNotifications[i].recipient,
        notificationType: userNotifications[i].notificationType,
        user: userNotifications[i].user,
        contentID: userNotifications[i].contentID,
        imageURL: user.imageURL,
        videoTitle: video.title,
        videoURL: video.videoURL,
        uploader: video.uploader
      }
      notifications.push(notif);
    } else {
      const notif = {
        read: userNotifications[i].read,
        id: userNotifications[i].id,
        recipient: userNotifications[i].recipient,
        notificationType: userNotifications[i].notificationType,
        user: userNotifications[i].user,
        contentID: userNotifications[i].contentID,
        imageURL: user.imageURL
      }
      notifications.push(notif);
    }
  }

  res.send(notifications);
}));

//Fetch notifications for user
router.get('/notifications/:notificationID', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("users/login");
    return;
  }

  const notification = await Notifications.findOne({where: {id: req.params.notificationID}});
  if (notification == null) {
    res.render('404', {message: "That notification does not exist"});
  }

  const type = notification.notificationType;
  await notification.update({read: true});
  if (type == "Subscribe") {
    res.redirect(`/users/${notification.user}`);
    return;
  } else if (type == "watchParty") {
    res.redirect(`/watch-party/session/${notification.contentID}`);
    return;
  } else {
    res.redirect(`/video/${notification.contentID}`);
    return;
  }
}));

//Handle subbing/unsubbing
router.post('/:user/handle-sub', tools.asyncHandler(async (req, res) => {

  //Make sure user is logged in
  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const uploader = await UserInfo.findOne({where: { username: req.params.user }})

  //Check if user is subscribed
  const subscription = await Subscriptions.findOne({
    where: {subscriber: username, user: uploader.username}});
  

  if (subscription == null) { 
    const sub = await Subscriptions.create({user: uploader.username, subscriber: username});
    const newSubCount = uploader.subscriberCount + 1;
    await uploader.update({ subscriberCount: newSubCount });

    //Notify user that they have been subbed to
    //Make sure there isn't a sub notification yet
    const alreadyExists = await Notifications.findOne({where: {user: uploader.username, recipient: username, notificationType: "Subscribe"}});
    if (alreadyExists == null && uploader.username != username) {
      await Notifications.create({
        user: username,
        notificationType: "Subscribe",
        recipient: uploader.username,
        contentID: sub.id
      });
    }

    res.status(200).send({subscribers: newSubCount, subscribeStatus: "Unsubscribe"});
  } else {
    await subscription.destroy();
    const newSubCount = uploader.subscriberCount - 1;
    await uploader.update({ subscriberCount: newSubCount });
    res.status(200).send({subscribers: newSubCount, subscribeStatus: "Subscribe"});
  }

}));

//Update notification and message read numbers
router.post('/update-notifications', tools.asyncHandler(async (req, res) => {

  //Make sure user is logged in
  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  //Get number of unread messages
  
  let messages = await Message.findAll({where: {recipient: username, read: false}});
  let usersFilled = [];
  let recentMessages = [];
  //Get rid of duplicates
  for (let i = 0; i < messages.length; i++) {
    const user = messages[i].sender == username ? messages[i].recipient : messages[i].sender;
    if (usersFilled.includes(user)) {
      continue;
    }
    usersFilled.push(user);
    recentMessages.push(messages[i]);
  }
  const unreadMessages = recentMessages.length;

  //Get number of unread notifications
  const notifications = await Notifications.findAll({where: {recipient: username, read: false}});
  const unreadNotifications = notifications.length;

  res.send({unreadMessages, unreadNotifications});

}));

module.exports = router;