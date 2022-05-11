import jwt from "jsonwebtoken";
import sharp from "sharp";
import path from "path";
import fs from "fs";

export const createJWToken = (user: any): string => {
  const token = jwt.sign(
    {
      data: user,
    },
    process.env.JWT_SECRET_KEY || "",
    {
      expiresIn: process.env.JWT_MAX_AGE,
      algorithm: "HS256",
    }
  );

  return token;
};

export const createErrorMessage = (
  status: "OK" | "Error",
  message: string
) => ({
  status,
  message,
});

export const sharpImage = async (img: Express.Multer.File) => {
  const newFileName =
    "another-" +
    img.filename.split(".").splice(0, 1).concat([".jpeg"]).join("");
  await sharp(img.path)
    .resize(150, 150)
    .toFormat("jpeg")
    .toFile(path.resolve(img.destination, newFileName));
  fs.unlinkSync(path.resolve(img.destination, img.filename));
  return newFileName;
};

export const merge = (arr1: any[], arr2: any[]) => {
  return arr1.map((value: any, index) => ({ ...value, ...arr2[index] }));
};
