import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import upload from "./config/upload";
import "./config/db";
import { AuthController } from "./controllers";

const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Auth
app.post("/check-email", AuthController.checkEmailExistence);
app.post("/create-user", upload.single("avatar"), AuthController.createUser);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
