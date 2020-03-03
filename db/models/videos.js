const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Video extends Sequelize.Model {}
  Video.init({
    title: {
      type: Sequelize.STRING,
      allowNull: true
    },
    descriptions: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    uploadDate: {
      type: Sequelize.DATE,
      allowNull: false
    },
    tags: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, { sequelize });

  return Video;
};