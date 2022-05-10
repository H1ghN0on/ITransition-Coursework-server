"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ItemAttributeValue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ItemAttributeValue.init(
    {
      item_id: DataTypes.INTEGER,
      attribute_id: DataTypes.INTEGER,
      text: DataTypes.TEXT,
      string: DataTypes.STRING,
      checkbox: DataTypes.BOOLEAN,
      date: DataTypes.DATE,
      number: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ItemAttributeValue",
    }
  );
  return ItemAttributeValue;
};
