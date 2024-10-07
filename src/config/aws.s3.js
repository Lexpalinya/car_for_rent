import { S3Client } from "@aws-sdk/client-s3";
import {
  AWS_ACCESS_KEY,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "./api.config";

// Initialize S3Client
const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});
// console.log("AWS Credentials: ", {
//   accessKeyId: AWS_ACCESS_KEY,
//   secretAccessKey: AWS_SECRET_ACCESS_KEY ? "***hidden***" : "missing",
//   region: AWS_REGION,
// });

export default s3Client;
