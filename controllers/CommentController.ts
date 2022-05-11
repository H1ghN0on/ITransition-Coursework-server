import express from "express";
import { use } from "passport";
import { createErrorMessage } from "../utils";

const { Comment, User } = require("../models");

class CommentController {
  async create(req: express.Request, res: express.Response) {
    const user = req.user as any;
    if (!user) {
      res.status(401).send(createErrorMessage("Error", "Unauthorized"));
      return;
    }
    try {
      const { item_id, text } = req.body;
      const comment = await Comment.create({
        item_id,
        text,
        user_id: user.data.id,
      });

      const sender = await User.findOne({ where: { id: user.data.id } });

      res.send({ status: "OK", comment, user: sender });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }

  async ofItem(req: express.Request, res: express.Response) {
    try {
      const id = req.params.id;
      const dbComments = await Comment.findAll({
        where: { item_id: id },
        order: [["id", "DESC"]],
      });
      const comments = [];
      for (let comment of dbComments) {
        const user = await User.findOne({ where: { id: comment.user_id } });
        comments.push({
          comment: comment.dataValues,
          user: user.dataValues,
        });
      }
      res.send({ status: "OK", comments });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(createErrorMessage("Error", "Database Error occured"));
    }
  }
}

export default new CommentController();
