import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import upload from "./config/upload";
import session from "express-session";
import "./config/db";
import {
  AuthController,
  CollectionController,
  ItemController,
} from "./controllers";
import { passport } from "./config/passport";

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(
  session({ secret: "secret cat", resave: true, saveUninitialized: true })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

//Auth
app.get(
  "/auth/me",
  passport.authenticate("jwt", { session: false }),
  AuthController.getMe
);
app.post("/check-email", AuthController.checkEmailExistence);
app.post("/create-user", upload.single("avatar"), AuthController.createUser);
app.post("/login", AuthController.login);
app.get("/auth/vk", passport.authenticate("vk", { scope: ["email"] }));
app.get(
  "/auth/vk/callback",
  passport.authenticate("vk", {
    failureRedirect: "/auth/vk/error",
  }),
  AuthController.vkAuth
);

//Collections

app.post(
  "/create-collection",
  passport.authenticate("jwt", { session: false }),
  upload.single("avatar"),
  CollectionController.create
);
app.get("/get-collections/:id", CollectionController.getAll);
app.get("/get-collection/:id", CollectionController.getOne);
app.get("/get-top-collections", CollectionController.getTop);

app.post(
  "/edit-collection/:id",
  passport.authenticate("jwt", { session: false }),
  upload.single("avatar"),
  CollectionController.edit
);
app.delete(
  "/delete-collection/:id",
  passport.authenticate("jwt", { session: false }),
  CollectionController.delete
);

//Items
app.post(
  "/create-item",
  passport.authenticate("jwt", { session: false }),
  ItemController.create
);

app.post(
  "/edit-item",
  passport.authenticate("jwt", { session: false }),
  ItemController.edit
);
app.delete(
  "/delete-item/:id",
  passport.authenticate("jwt", { session: false }),
  ItemController.delete
);

app.post(
  "/create-column",
  passport.authenticate("jwt", { session: false }),
  ItemController.createColumn
);

app.post(
  "/delete-column",
  passport.authenticate("jwt", { session: false }),
  ItemController.deleteColumn
);

app.get("/get-collection-data/:id", ItemController.getAllFromCollection);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
