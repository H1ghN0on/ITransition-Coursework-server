import express from "express";
import { createErrorMessage, sharpImage } from "../utils";

const { Collection } = require("../models");

class CollectionController {
  async create(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (user) {
      try {
        const { name, description, topics } = req.body;
        const avatarURL = req.file
          ? await sharpImage(req.file)
          : "default.jpeg";
        const collectionData = {
          name,
          description,
          avatarURL,
          topics: JSON.parse(topics),
          belongsTo: user.data.id,
          items: 0,
        };

        const collection = await Collection.create(collectionData);
        res.send({ status: "OK", collection });
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .send(createErrorMessage("Error", "Database Error occured"));
      }
    } else {
      res.status(401).send(createErrorMessage("Error", "Unauthorized"));
    }
  }

  async getAll(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      const collections = await Collection.findAll({
        where: { belongsTo: id },
      });

      res.send({ status: "OK", collections });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
}

export default new CollectionController();
