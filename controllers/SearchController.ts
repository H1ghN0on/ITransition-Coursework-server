import express from "express";
import sequelize, { Op } from "sequelize";
import { createErrorMessage } from "../utils";

const { Item, Comment, ItemAttributeValue } = require("../models");

const findAllReferences = async (query: string) => {
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
  return itemIds;
};

class SearchController {
  async search(req: express.Request, res: express.Response) {
    const query = req.params.query;
    try {
      const itemIds = await findAllReferences(query);
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
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async searchByTag(req: express.Request, res: express.Response) {
    const query = req.params.query;
    try {
      const items = await Item.findAll({
        where: {
          tags: { [Op.contains]: [query] },
        },
      });
      res.send({ items });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async countTags(req: express.Request, res: express.Response) {
    const tags = new Map();
    try {
      const items = await Item.findAll();
      for (let item of items) {
        for (let tag of item.tags) {
          if (!tags.has(tag)) {
            tags.set(tag, 0);
          }

          const number = tags.get(tag);
          tags.set(tag, number + 1);
        }
      }

      res.send({ ...Object.fromEntries(tags) });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
}

export default new SearchController();
