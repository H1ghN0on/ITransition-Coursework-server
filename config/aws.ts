import AWS from "aws-sdk";
import fs from "fs";
import path from "path";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

export const deleteFile = (filePath: string) => {
  const params = {
    Bucket: process.env.AWS_BUCKET!,
    Key: filePath,
  };
  s3.deleteObject(params, (err, data) => {
    if (err) {
      throw err;
    }
  });
};

export const uploadFile = async (filePath: string, newFilePath: string) => {
  const fileContent = fs.readFileSync(path.resolve(filePath));
  const params = {
    Bucket: process.env.AWS_BUCKET!,
    Key: newFilePath,
    Body: fileContent,
    acl: "public",
  };

  await s3
    .upload(params, (err: any) => {
      if (err) {
        throw err;
      }
    })
    .promise();
};
