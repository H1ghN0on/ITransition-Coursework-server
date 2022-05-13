"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Comments", "textField", Sequelize.TSVECTOR);
    await queryInterface.addColumn(
      "ItemAttributeValues",
      "textField",
      Sequelize.TSVECTOR
    );
  },
};
