const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Message extends Sequelize.Model {}
  Message.init({
    sender: {
      type: Sequelize.STRING,
      allowNull: true
    },
    recipient: {
      type: Sequelize.STRING,
      allowNull: false
    },
    message: {
      type: Sequelize.STRING,
      allowNull: false
    },
    read: {
      type: Sequelize.INTEGER,
      default: 0
    }
  }, { sequelize });

  return Message;
};