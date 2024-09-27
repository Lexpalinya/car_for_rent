import express from "express";
import prisma from "./utils/prisma.client";
import cors from "cors";
import fileUpload from "express-fileupload";
import morgan from "morgan";
import redis from "./DB/redis";
import APIRoute from "./routes/index.routes";
import { EAPI, SERVER_PORT } from "./config/api.config";
import { broadcast, initSocketServer } from "./server/socketIO.server"; // Import the Socket.IO setup
import NotificationController from "./controllers/notification.controller";

const app = new express();

app.use(express.json({ limit: "500mb" }));
app.use(
  express.urlencoded({ extended: false, limit: "500mb", parameterLimit: 500 })
);
app.use(fileUpload());
app.use(morgan());

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
    }, 5000);
  }
};

await redis.flushdb();
// await NotificationController.notiNew({
//   data: "test",
//   type: "customer",
//   title: "car_rent",
//   user_id: "90542f76-d080-405d-bae6-996b709cd187",
//   ref_id: "test",
//   text: "test",
//   role: "customer",
// });

// const a = await NotificationController.getNoti({
//   user_id: "90542f76-d080-405d-bae6-996b709cd187",
//   type: "admin",
// });
// console.log("a :>> ", a);
export const server = app.listen(SERVER_PORT, async () => {
  console.log(`server listening on port:${SERVER_PORT}`);
  console.log(`Express is running at http://localhost:${SERVER_PORT}`);
  await CheckConnectionDatabase();

  // Initialize Socket.IO after the server is up
  initSocketServer(server);
});
