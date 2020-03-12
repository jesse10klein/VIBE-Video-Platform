const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Bookmarks extends Sequelize.Model {}
  Bookmarks.init({
    username: {
      type: Sequelize.STRING,
      allowNull: true
    },
    videoID: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  }, { sequelize });

  return Bookmarks;
};