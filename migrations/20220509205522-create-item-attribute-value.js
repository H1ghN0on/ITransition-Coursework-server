"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ItemAttributeValues", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      item_id: {
        type: Sequelize.INTEGER,
      },
      attribute_id: {
        type: Sequelize.INTEGER,
      },
      value_text: {
        type: Sequelize.TEXT,
      },
      value_string: {
        type: Sequelize.STRING,
      },
      value_boolean: {
        type: Sequelize.BOOLEAN,
      },
      value_date: {
        type: Sequelize.DATE,
      },
      value_integer: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ItemAttributeValues");
  },
};
