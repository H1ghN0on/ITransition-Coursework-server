import express from "express";
import sequelize, { Op } from "sequelize";

const { Item, Comment, ItemAttributeValue } = require("../models");

class SearchController {
  async search(req: express.Request, res: express.Response) {
    const query = req.params.query;

    const itemAttributeValues = await ItemAttributeValue.findAll({
      where: {
        textField: {
          [Op.match]: sequelize.fn("to_tsquery", query),
        },
      },
    });

    const comments = await Comment.findAll({
      where: {
        textField: {
          [Op.match]: sequelize.fn("to_tsquery", query),
        },
      },
    });

    const itemIds = [
      ...itemAttributeValues.map((obj: any) => obj.item_id),
      ...comments.map((obj: any) => obj.item_id),
    ];
    const items = await Item.findAll({
      where: {
        [Op.or]: [
          {
            textField: {
              [Op.match]: sequelize.fn("to_tsquery", query),
            },
          },
          { id: { [Op.in]: itemIds } },
        ],
      },
    });
    res.send({ items });
  }
}

export default new SearchController();
