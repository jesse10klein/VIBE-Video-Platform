const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Notifications extends Sequelize.Model {}
  Notifications.init({
    recipient: {
      type: Sequelize.STRING,
      allowNull: false
    },
    notificationType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    user: {
      type: Sequelize.STRING,
      allowNull: false
    },
    contentID: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    read: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, { sequelize });

  return Notifications;
};