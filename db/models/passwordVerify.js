const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class passwordVerify extends Sequelize.Model {}
  passwordVerify.init({
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    verifyID: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, { sequelize });

  return passwordVerify;
};
