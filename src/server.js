import express from "express";
import prisma from "./utils/prisma.client";
import cors from "cors";
import fileUpload from "express-fileupload";
import morgan from "morgan";
import redis from "./DB/redis";
import APIRoute from "./routes/index.routes";
import { EAPI, SERVER_PORT } from "./config/api.config";

const app = new express();

app.use(express.json({ limit: "500mb" }));
app.use(
  express.urlencoded({ extended: false, limit: "500mb", parameterLimit: 500 })
);
app.use(fileUpload());
app.use(morgan("dev"));

app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Access-Token",
      "Accept",
    ],
  })
);

app.use(EAPI, APIRoute);
const CheckConnectionDatabase = async () => {
  try {
    await prisma.$connect();
    console.log(`Connecting database successful.`);
  } catch (error) {
    console.error(`connected database error: ${error}`);
    setTimeout(async () => {
      console.error(`reconnecting database ...`);
      await CheckConnectionDatabase();
    }, 10000);
  }
};

// await redis.del("banners");
// const c = await CachDataAll("banners", "banners", { is_active: true });
// console.log("object :>> ", c);
app.listen(SERVER_PORT, async () => {
  await CheckConnectionDatabase();
  console.log(`server listening on port:${SERVER_PORT}`);
  console.log(`url: http://localhost:${SERVER_PORT}`);
});
