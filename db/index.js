
//THIS FILE IS REQUIRING THE MODELS FOR APP.JS

const path = require('path');
const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'INFS3202.db'),
  logging: false
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

console.log(__dirname);

db.models.UserInfo = require(path.join(__dirname, 'models/userinfo.js'))(sequelize);
db.models.Video = require(path.join(__dirname, 'models/videos.js'))(sequelize);
db.models.Comments = require(path.join(__dirname, 'models/comments.js'))(sequelize);
db.models.Subscriptions = require(path.join(__dirname, 'models/subscriptions.js'))(sequelize);
db.models.Bookmarks = require(path.join(__dirname, 'models/bookmarks.js'))(sequelize);
db.models.videoVotes = require(path.join(__dirname, 'models/videoVotes.js'))(sequelize);
db.models.commentVotes = require(path.join(__dirname, 'models/commentVotes.js'))(sequelize);
db.models.passwordVerify = require(path.join(__dirname, 'models/passwordVerify.js'))(sequelize);
db.models.Message = require(path.join(__dirname, 'models/message.js'))(sequelize);

module.exports = db;