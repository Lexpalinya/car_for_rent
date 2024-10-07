import sharp from "sharp";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_BUCKET_KEY } from "../config/api.config";
import s3Client from "../config/aws.s3";

export const S3UploadImage = async ({ name, data }, oldFile) => {
  try {
    // if (oldFile) {
    //   const deleteParams = {
    //     Bucket: AWS_BUCKET_KEY,
    //     Key: "images/" + oldFile,
    //   };
    //   console.log("Delete params :>> ", deleteParams);

    //   // Use the v3 DeleteObjectCommand
    //   const deleteCommand = new DeleteObjectCommand(deleteParams);
    //   const deleteResult = await s3Client.send(deleteCommand);
    //   console.log("Delete Result :>> ", deleteResult);
    // }

    // Convert image to WebP
    const webpBuffer = await sharp(data).toFormat("webp").toBuffer();
    const timeid = Date.now().toString().slice(-10);
    const filenamekey = timeid + "-" + name.replace(/\.[^/.]+$/, ".webp");

    const uploadParams = {
      Bucket: AWS_BUCKET_KEY,
      Key: "images/" + filenamekey,
      Body: webpBuffer,
      ContentType: "image/webp",
    };
    console.log("uploadParams :>> ", uploadParams);

    // Use the v3 PutObjectCommand
    const uploadCommand = new PutObjectCommand(uploadParams);
    let result = await s3Client.send(uploadCommand);
    console.log("result :>> ", result);
    result = filenamekey;
    return result;
  } catch (error) {
    throw error;
  }
};
