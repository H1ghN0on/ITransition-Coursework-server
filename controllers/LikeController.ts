import express from "express";
import { createErrorMessage } from "../utils";

const { Like } = require("../models");

class LikeController {
  async setLike(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (!user) {
      res.status(401).send(createErrorMessage("Error", "Unauthorized"));
      return;
    }
    try {
      const { item_id, user_id } = req.body;

      const like = await Like.findOne({
        where: {
          item_id,
          user_id,
        },
      });
      if (!like) {
        await Like.create({ item_id, user_id });
      } else {
        await like.destroy();
        await like.save();
      }
      res.send({ status: "OK" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
}

export default new LikeController();
