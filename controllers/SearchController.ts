import express from "express";
import sequelize, { Op } from "sequelize";
import { createErrorMessage } from "../utils";

const { Item, Comment, ItemAttributeValue, Collection } = require("../models");

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
      for (let item of items) {
        const collection = await Collection.findOne({
          where: { id: item.belongsTo },
        });
        item.dataValues.belongsTo = collection;
      }
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
      for (let item of items) {
        const collection = await Collection.findOne({
          where: { id: item.belongsTo },
        });
        item.dataValues.belongsTo = collection;
      }

      res.send({ items });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async countTags(req: express.Request, res: express.Response) {
    const MAX_TAG_NUMBER_IN_CLOUD = 15;
    const tagsMap = new Map();
    try {
      const items = await Item.findAll();
      for (let item of items) {
        for (let tag of item.tags) {
          if (!tagsMap.has(tag)) {
            tagsMap.set(tag, 0);
          }

          const number = tagsMap.get(tag);
          tagsMap.set(tag, number + 1);
        }
      }
      const tags: any[] = [];
      tagsMap.forEach((value, key) => {
        tags.push({ value: key, count: value });
      });
      tags.sort((a, b) => b.count - a.count);
      res.send({ tags: tags.splice(0, MAX_TAG_NUMBER_IN_CLOUD) });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
}

export default new SearchController();
