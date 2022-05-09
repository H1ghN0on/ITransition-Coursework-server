import express from "express";
import { createErrorMessage, createJWToken, sharpImage } from "../utils";
const { User } = require("../models");

const getUserByEmail = async (email: string) => {
  let user = await User.findOne({ where: { email: email } });
  if (user) {
    return createErrorMessage(
      "Error",
      "This email is already registered. Try another one"
    );
  }
  return { status: "OK" };
};

const getUserByUsername = async (username: string) => {
  let user = await User.findOne({ where: { username: username } });
  if (user) {
    return createErrorMessage(
      "Error",
      "This username is already registered. Try another one"
    );
  }
  return { status: "OK" };
};

const addUserToDB = async (userInfo: {
  avatarURL: string;
  username: string;
  password: string;
  email: string;
}) => {
  const { avatarURL, username, password, email } = userInfo;
  try {
    const user = await User.create({
      avatarURL,
      username,
      password,
      email,
    });
    if (user) {
      const token = createJWToken(user);
      const userData = {
        ...user.dataValues,
        token,
      };
      return { status: "OK", userData };
    } else {
      return createErrorMessage(
        "Error",
        "Database error occured. Try again later."
      );
    }
  } catch (error) {
    console.log(error);
    return createErrorMessage(
      "Error",
      "Database error occured. Try again later."
    );
  }
};

class AuthController {
  getMe(req: express.Request, res: express.Response) {
    res.json(req.user);
  }
  async createUser(req: express.Request, res: express.Response) {
    const avatar = req.file;
    const { email, password, username } = req.body;
    const userExistStatus = await getUserByUsername(username);
    if (userExistStatus.status == "OK") {
      let avatarURL = "default.jpeg";
      if (avatar) {
        avatarURL = await sharpImage(avatar);
      }
      const addUserStatus = await addUserToDB({
        avatarURL,
        username,
        password,
        email,
      });

      res.send(addUserStatus);
    } else {
      res.send(userExistStatus);
    }
  }

  async checkEmailExistence(req: express.Request, res: express.Response) {
    const status = await getUserByEmail(req.body.email);
    res.send(status);
  }

  async login(req: express.Request, res: express.Response) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({
        where: { email: email, password: password },
      });

      if (!user) {
        res.send(createErrorMessage("Error", "This user is not registered"));
      } else {
        const token = createJWToken(user);
        const userData = {
          ...user.dataValues,
          token,
        };
        res.send({ status: "OK", userData });
      }
    } catch (error) {
      console.log(error);
      res.send(createErrorMessage("Error", "Database error occured"));
    }
  }

  async vkAuth(req: express.Request, res: express.Response) {
    if (req.user) {
      const vk_user = req.user as any;
      let user = await User.findOne({
        where: { vkID: vk_user.id.toString() },
      });

      if (!user) {
        const userData = {
          vkID: vk_user.id.toString(),
          username: vk_user.username,
          avatarURL: vk_user.photos ? vk_user.photos[0].value : "default.jpeg",
          email: vk_user.emails ? vk_user.emails[0].value : "",
        };
        user = await User.create(userData);
      }
      const token = createJWToken(user);
      const userData = {
        ...user.dataValues,
        token,
      };
      res.send(
        `<script>window.opener.postMessage('${JSON.stringify(
          userData
        )}', "*");window.close()</script>`
      );
    }
  }
}

export default new AuthController();
