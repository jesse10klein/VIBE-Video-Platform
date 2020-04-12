
//THIS FILE IS REQUIRING THE MODELS FOR APP.JS

const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'INFS3202.db',
  logging: false
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

db.models.UserInfo = require('./models/userinfo.js')(sequelize);
db.models.Video = require('./models/videos.js')(sequelize);
db.models.Comments = require('./models/comments.js')(sequelize);
db.models.Subscriptions = require('./models/subscriptions.js')(sequelize);
db.models.Bookmarks = require('./models/bookmarks.js')(sequelize);
db.models.videoVotes = require('./models/videoVotes.js')(sequelize);
db.models.commentVotes = require('./models/commentVotes.js')(sequelize);

module.exports = db;