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
    },
    videoID: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    videoStatus: {
      type: Sequelize.STRING,
      defaultValue: "0,true"
    }
  }, { sequelize });

  return watchParty;
};
