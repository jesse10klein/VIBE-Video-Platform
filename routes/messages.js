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

//Get messages for user
router.get("/", tools.asyncHandler(async (req, res) => {

  console.log("HELLO");

  const { username } = req.session;
  if (username == null) {
    res.redirect("/");
    return;
  }

  const recentMessages = await tools.getRecentMessages(username);

  res.render("messageViews/messages", {recentMessages, username});
}));

//Placeholder
router.get('/:user', tools.asyncHandler(async (req, res) => {

  const { username } = req.session;
  if (username == null) {
    res.redirect("/");
    return;
  }

  const { user } = req.params;
  console.log(user);
  console.log(username);
  
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

  messages = messages.concat(messages2);
  messages.sort((a, b) => (a.createdAt > b.createdAt) ? 1 : -1);

  //Format messages
  for (let i = 0; i < messages.length; i++) {
    messages[i].formattedTimeSince = tools.formatTimeSince(messages[i].createdAt);
    messages[i].sentByUser = (username == messages[i].sender);
  }

  res.render("messageViews/messages", {username, recentMessages, messages});
}));

module.exports = router;