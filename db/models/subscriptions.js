const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Subscriptions extends Sequelize.Model {}
  Subscriptions.init({
    user: {
      type: Sequelize.STRING,
      allowNull: true
    },
    subscriber: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, { sequelize });

  return Subscriptions;
};
