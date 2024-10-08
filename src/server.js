import express from "express";
import prisma from "./utils/prisma.client";
import cors from "cors";
import fileUpload from "express-fileupload";
import morgan from "morgan";
import redis from "./DB/redis";
import APIRoute from "./routes/index.routes";
import { EAPI, SERVER_PORT } from "./config/api.config";
import { initSocketServer } from "./server/socketIO.server"; // Import the Socket.IO setup
import { SendNotificationToUser } from "./services/noti.services";

const app = new express();

app.use(express.json({ limit: "500mb" }));
app.use(
  express.urlencoded({ extended: false, limit: "500mb", parameterLimit: 500 })
);
app.use(fileUpload());
app.use(morgan("combined"));

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
//   ref_id: "23669040-8bc6-481d-874f-69b382a8b7e8",
//   text: "test",
//   role: "customer",
//   token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjliODVjNTk4LTc2NGUtNDU1My04MzIxLTgzMmY2Y2ZjNjkzNiIsImlhdCI6MTcyNjEzNDU1OSwiZXhwIjoxNzY5MzM0NTU5fQ.TxBmrTlaITy3l5YdFyochTkuCItWMAoeQILgZ0c-w8g"
// });
// SendNotificationToUser({
//   title: "new order",
//   text: "new order is available",
//   image:
//     "https://static.vecteezy.com/system/resources/thumbnails/043/033/254/small_2x/colored-pencils-arranged-neatly-in-a-row-photo.jpg",
//   ref_id: "23669040-8bc6-481d-874f-69b382a8b7e8",
//   user_id:"fe44bd77-1d72-4ce4-9d2f-c95b0ee78fba",
//   role:"customer",
//   type:"car_rent_user"
// });
// const a = await CachDataFindUserNoClear(
//   "ID_user",
//   "users",
//   {
//     is_active: true,
//   },
//   {
//     id: true,
//     username: true,
//     email: true,
//     phone_number: true,
//     password: true,
//     login_version: true,
//     blacklist: true,
//     role: true,
//     device_token: true,
//   }
// );
// console.log(" a :>> ", a);

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
