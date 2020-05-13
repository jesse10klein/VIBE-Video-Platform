const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class watchParty extends Sequelize.Model {}
  watchParty.init({
    host: {
      type: Sequelize.STRING,
      allowNull: false
    },
    joinLink: {
      type: Sequelize.STRING,
      allowNull: false
    },
    users: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, { sequelize });

  return watchParty;
};
