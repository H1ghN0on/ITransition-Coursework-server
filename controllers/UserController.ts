import express from "express";
import { deleteFile } from "../config/aws";
import { createErrorMessage } from "../utils";
import { s3 } from "../config/aws";
const { User } = require("../models");

const USER_STATUS = ["user", "admin", "block"];
const AWS_DESTINATION = "avatars/users/";

class UserController {
  async setStatus(req: express.Request, res: express.Response) {
    const id = req.params.id;
    const status = req.params.status;

    if (!USER_STATUS.includes(status)) {
      res.send({ status: "Error", message: "unknown status" });
    } else {
      try {
        await User.update({ status }, { where: { id } });
        res.send({ status: "OK" });
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .send(createErrorMessage("Error", "Database Error occured"));
      }
    }
  }

  async getById(req: express.Request, res: express.Response) {
    const id = req.params.id;
    try {
      const user = await User.findOne({ where: { id } });

      if (!user.avatarURL.startsWith("https")) {
        const params = {
          Bucket: "itransition-coursework",
          Key: "avatars/users/" + user.avatarURL,
        };
        var promise = await s3.getSignedUrlPromise("getObject", params);
        user.dataValues.avatarURL = promise;
      }

      res.send({ user });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async delete(req: express.Request, res: express.Response) {
    const id = req.params.id;
    try {
      const user = await User.findOne({ where: { id: id } });
      if (user.avatarUrl !== "default.jpeg") {
        await deleteFile(AWS_DESTINATION + user.avatarUrl);
      }
      await user.destroy();
      await user.save();
      res.send({ status: "OK" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async getAll(req: express.Request, res: express.Response) {
    try {
      const users = await User.findAll({ order: [["id", "ASC"]] });
      for (let user of users) {
        if (!user.avatarURL.startsWith("https")) {
          const params = {
            Bucket: "itransition-coursework",
            Key: "avatars/users/" + user.avatarURL,
          };
          var promise = await s3.getSignedUrlPromise("getObject", params);
          user.dataValues.avatarURL = promise;
        }
      }

      res.send({ status: "OK", users });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
}

export default new UserController();
