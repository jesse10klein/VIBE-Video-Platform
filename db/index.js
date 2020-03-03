
//THIS FILE IS REQUIRING THE MODELS FOR APP.JS

const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'INFS3202.db',
  logging: true
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

db.models.UserInfo = require('./models/userInfo.js')(sequelize);
db.models.Videos = require('./models/videos.js')(sequelize);
db.models.Comments = require('./models/comments.js')(sequelize);

module.exports = db;