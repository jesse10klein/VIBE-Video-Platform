const express = require('express')
const router = express.Router();
const path = require('path');
const db = require(path.join(__dirname, '../db'));

//Require and use modules
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
const cookieParser = require('cookie-parser');
router.use(cookieParser());

//Require helper functions
var tools = require(path.join(__dirname, 'helperFunctions'));

const { UserInfo } = db.models;
const { Message } = db.models;
const Op = require('sequelize').Op;

router.get("/", (req, res) => {
  res.redirect("/messages/home");
})

//Get messages with a specific user
router.get('/:user', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/");
    return;
  }

  const { user } = req.params;

  if (user == "home") {
    const recentMessages = await tools.getRecentMessages(username);
    res.render("messageViews/messages", {recentMessages, username});
    return;
  }
  
  const findUser = await UserInfo.findOne({where: {username: user}});
  if (findUser == null) {
    res.redirect('/');
    return;
  }

  const recentMessages = await tools.getRecentMessages(username);

  //Get messages to and from user
  let messages = await Message.findAll({
    order: [["createdAt", "DESC"]],
    where: {
      [Op.and]: {
        sender: username, 
        recipient: user
      }
    }
  });

  let messages2  = await Message.findAll({
    order: [["createdAt", "DESC"]],
    where: {
      [Op.and]: {
        sender: user, 
        recipient: username
      }
    }
  });
  //Update most recent message to read

  messages = messages.concat(messages2);
  messages.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);


  //Format messages
  for (let i = 0; i < messages.length; i++) {
    messages[i].formattedTimeSince = tools.formatTimeSince(messages[i].createdAt);
    messages[i].sentByUser = (username == messages[i].sender);
    
    if (!messages[i].read) {
      console.log("Updating read status");
      await messages[i].update({read: true});
    }
  }

  //Make sure opened message is read
  for (let i = 0; i < recentMessages.length; i++) {
    if (recentMessages[i].sender == req.params.user) {
      recentMessages[i].read = true;
    }
  }


  res.render("messageViews/messages", {username, recentMessages, messages, findUser});
}));

//Add a message to the system
router.post('/:user/add-message', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const { message } = req.body;
  const messageSent = await Message.create({message, sender: username, recipient: req.params.user, read: false});

  res.send({ messageSent });
}));

//Process user search autocomplete
router.post('/:user/process-autocomplete', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const { searchTerm } = req.body;

  const matches = await UserInfo.findAll({
    where: {
      username: {[Op.startsWith]: searchTerm}
    }
  });

  res.send({matches});

}));

//Poll for new messages
router.post('/:user/poll-for-messages', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const { lastRecievedID } = req.body;

  const messages = await Message.findAll({
    where: {sender: req.params.user, recipient: username},
    order: [["createdAt", "DESC"]]
  });

  let newMessages = [];

  for (let i = 0; i < messages.length; i++) {
    if (messages[i].id == lastRecievedID) {
      break;
    }
    newMessages.push(messages[i]);
  }
  res.send({newMessages});
}));

//Poll for all messages
router.post('/:user/poll-for-all-messages', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/users/login");
    return;
  }

  const messages = await Message.findAll({
    where: {
      recipient: username,
      createdAt: {
        [Op.gt]: new Date(new Date() - 10 * 1000) //Last 10 seconds
      }
    },
    order: [["createdAt", "DESC"]],
  });

  const filtered = []
  const filteredMessages = [];
  //Make sure there are no duplicates ( Case where two send in same poll )
  for (let i = 0; i < messages.length; i++) {
    if (filtered.includes(messages[i].sender)) {
      continue;
    }
    const user = await UserInfo.findOne({where: {username: messages[i].sender}});
    const formatted = {
      createdAt: messages[i].createdAt,
      id: messages[i].id,
      message: messages[i].message,
      read: messages[i].read,
      recipient: messages[i].recipient,
      sender: messages[i].sender,
      imageURL: user.imageURL
    }
    filteredMessages.push(formatted);
    filtered.push(messages[i].sender);
  }

  res.send({messages: filteredMessages});
}));

module.exports = router;