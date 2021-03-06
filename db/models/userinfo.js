const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class UserInfo extends Sequelize.Model {}
  UserInfo.init({
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    subscriberCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    imageURL: {
      type: Sequelize.STRING,
      defaultValue: "default.png"
    },
    bannerURL: {
      type: Sequelize.STRING,
      defaultValue: "default.jpg"
    },
    emailVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, { sequelize });

  return UserInfo;
};
