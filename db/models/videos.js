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
    viewCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    tags: {
      type: Sequelize.STRING,
      allowNull: false
    },
    upvotes: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    downvotes: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, { sequelize });

  return Video;
};