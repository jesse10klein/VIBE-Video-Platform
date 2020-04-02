const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class commentVotes extends Sequelize.Model {}
  commentVotes.init({
    videoID: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    user: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.INTEGER,
      allowNull: false,
      //0 for no vote, 1 for up, 2 for down
      defaultValue: 0
    }
  }, { sequelize });

  return commentVotes;
};