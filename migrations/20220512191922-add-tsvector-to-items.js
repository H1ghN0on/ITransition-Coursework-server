"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // logic for transforming into the new state
    return queryInterface.addColumn("Items", "textField", Sequelize.TSVECTOR);
  },
};
