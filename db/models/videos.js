const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Video extends Sequelize.Model {}
  Video.init({
    uploader: {
      type: Sequelize.STRING,
      allowNull: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    videoURL: {
      type: Sequelize.STRING,
      allowNull: false
    },
    uploadDate: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },
    tags: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, { sequelize });

  return Video;
};