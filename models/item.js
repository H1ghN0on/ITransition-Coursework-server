"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Item.init(
    {
      name: DataTypes.STRING,
      belongsTo: DataTypes.INTEGER,
      tags: DataTypes.ARRAY(DataTypes.STRING),
      textField: DataTypes.TSVECTOR,
    },
    {
      sequelize,
      modelName: "Item",
    }
  );
  return Item;
};
