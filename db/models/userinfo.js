const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class UserInfo extends Sequelize.Model {}
  UserInfo.init({
    username: {
      type: Sequelize.STRING,
      allowNull: true
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, { sequelize });

  return UserInfo;
};
