const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Comments extends Sequelize.Model {}
  Comments.init({
    user: {
      type: Sequelize.STRING,
      allowNull: true
    },
    videoID: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    comment: {
      type: Sequelize.STRING,
      allowNull: false
    },
    replyID: {
      type: Sequelize.INTEGER,
      defaultValue: -1
    },
    commentLikes: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    commentDislikes: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    edited: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  }, { sequelize });

  return Comments;
};