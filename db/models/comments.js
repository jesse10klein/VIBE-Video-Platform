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
    }
  }, { sequelize });

  return Comments;
};