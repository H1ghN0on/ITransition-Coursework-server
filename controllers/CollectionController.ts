import express from "express";
import { deleteFile, s3 } from "../config/aws";
import { createErrorMessage, sharpImage } from "../utils";
import { upload } from "../utils";

const { Collection, User } = require("../models");

const AWS_DESTINATION = "avatars/collections/";
class CollectionController {
  async create(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (user) {
      try {
        const { name, description, topics, belongsTo } = req.body;
        let avatarURL = "default.jpeg";
        if (req.file) {
          avatarURL = await sharpImage(req.file);
          await upload(avatarURL, req.file.destination, AWS_DESTINATION);
        }
        const collectionData = {
          name,
          description,
          avatarURL,
          topics: JSON.parse(topics),
          belongsTo,
          items: 0,
        };

        const collection = await Collection.create(collectionData);
        const user = await User.findOne({
          where: { id: collection.belongsTo },
        });

        const params = {
          Bucket: "itransition-coursework",
          Key: "avatars/collections/" + collection.avatarURL,
        };
        var promise = await s3.getSignedUrlPromise("getObject", params);
        collection.dataValues.avatarURL = promise;
        collection.dataValues.belongsTo = user;
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
        order: [["id", "ASC"]],
        where: { belongsTo: id },
      });

      for (let collection of collections) {
        const user = await User.findOne({
          where: { id: collection.belongsTo },
        });
        const params = {
          Bucket: "itransition-coursework",
          Key: "avatars/collections/" + collection.avatarURL,
        };
        var promise = await s3.getSignedUrlPromise("getObject", params);
        collection.dataValues.avatarURL = promise;
        collection.dataValues.belongsTo = user;
      }

      res.send({ status: "OK", collections });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async getTop(req: express.Request, res: express.Response) {
    try {
      const collections = await Collection.findAll({
        order: [["items", "DESC"]],
        limit: 10,
      });

      for (let collection of collections) {
        const user = await User.findOne({
          where: { id: collection.belongsTo },
        });
        const params = {
          Bucket: "itransition-coursework",
          Key: "avatars/collections/" + collection.avatarURL,
        };
        var promise = await s3.getSignedUrlPromise("getObject", params);
        collection.dataValues.avatarURL = promise;
        collection.dataValues.belongsTo = user;
      }

      res.send({ status: "OK", collections });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async delete(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (user) {
      try {
        const id = req.params.id;
        await Collection.destroy({
          where: { id },
        });

        res.send({ status: "OK" });
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

  async edit(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (user) {
      try {
        const id = req.params.id;
        const { name, description, topics } = req.body;
        const collection = await Collection.findOne({
          where: {
            id,
          },
        });
        let collectionData: any = {
          name,
          description,
          topics: JSON.parse(topics),
        };

        if (req.file) {
          if (collection.avatarURL !== "default.jpeg") {
            await deleteFile(AWS_DESTINATION + collection.avatarURL);
          }
          const avatarURL = await sharpImage(req.file);
          await upload(avatarURL, req.file.destination, AWS_DESTINATION);
          collectionData.avatarURL = avatarURL;
        }

        await collection.update(collectionData);
        await collection.save();
        const user = await User.findOne({
          where: { id: collection.belongsTo },
        });
        const params = {
          Bucket: "itransition-coursework",
          Key: "avatars/collections/" + collection.avatarURL,
        };
        var promise = await s3.getSignedUrlPromise("getObject", params);
        collection.dataValues.avatarURL = promise;
        collection.dataValues.belongsTo = user;
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

  async getOne(req: express.Request, res: express.Response) {
    const id = req.params.id;
    try {
      const collection = await Collection.findOne({
        where: { id },
      });
      const user = await User.findOne({ where: { id: collection.belongsTo } });
      collection.dataValues.belongsTo = user;
      const params = {
        Bucket: "itransition-coursework",
        Key: "avatars/collections/" + collection.avatarURL,
      };
      var promise = await s3.getSignedUrlPromise("getObject", params);
      collection.dataValues.avatarURL = promise;
      res.send({ status: "OK", collection });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
}

export default new CollectionController();
