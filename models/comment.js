"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Comment.init(
    {
      user_id: DataTypes.INTEGER,
      item_id: DataTypes.INTEGER,
      text: DataTypes.STRING,
      textField: DataTypes.TSVECTOR,
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );
  return Comment;
};
