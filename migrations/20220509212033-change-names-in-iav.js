"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "ItemAttributeValues",
      "value_text",
      "text"
    );
    await queryInterface.renameColumn(
      "ItemAttributeValues",
      "value_string",
      "string"
    );
    await queryInterface.renameColumn(
      "ItemAttributeValues",
      "value_boolean",
      "checkbox"
    );
    await queryInterface.renameColumn(
      "ItemAttributeValues",
      "value_date",
      "date"
    );
    await queryInterface.renameColumn(
      "ItemAttributeValues",
      "value_integer",
      "number"
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
