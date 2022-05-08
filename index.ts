import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import upload from "./config/upload";
import session from "express-session";
import "./config/db";
import { AuthController } from "./controllers";
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
