const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class partyNotifications extends Sequelize.Model {}
  partyNotifications.init({
    partyID: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    user: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, { sequelize });

  return partyNotifications;
};
