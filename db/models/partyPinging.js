const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class partyPinging extends Sequelize.Model {}
  partyPinging.init({
    partyID: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    user: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastPing: {
      type: Sequelize.DATE,
      allowNull: false
    }
  }, { sequelize });

  return partyPinging;
};
