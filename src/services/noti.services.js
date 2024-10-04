import messaging from "../config/firebase.Admin";
import prisma from "../utils/prisma.client";
import { CachDataAll } from "./cach.contro";
import { EMessage } from "./enum";
import { FindUserById_ID } from "./find";
import { select } from "../controllers/notification.controller";

const sendNotificationToAdmin = async ({ title, text, ref_id }) => {
  try {
    const adminLits = await CachDataAll(
      "usersnotificationadmin",
      "users",
      {
        is_active: true,
        OR: [{ role: "admin" }, { role: "superadmin" }],
      },
      { id: true, role: true, device_token: true }
    );

    const noti = await prisma.notification.create({
      data: {
        user_id: adminLits[0].id,
        title,
        text,
        ref_id,
        type: "car_rent",
        role: "admin",
      },
      select,
    });

    const notificationData = JSON.stringify(noti);
    const carImageUrl = noti?.car_rents?.post?.post_car_image[0]?.url;
    const SendMessage = async (device_token) => {
      try {
        const message = {
          notification: {
            title: title,
            body: text,
            image: carImageUrl || undefined, // Attach image if available
          },
          token: device_token,
          data: {
            newdata: notificationData,
          },
        };
        const response = await messaging.send(message);
        console.log("Notification sent successfully:", response);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    };

    const sendNotification = adminLits
      .filter((admin) => admin.device_token)
      .map((admin) => SendMessage(admin.device_token));
    await Promise.all(sendNotification);
    // Create the notification record in the database
    return { message: EMessage.SUCCESS, data: noti };
  } catch (err) {
    console.error("Error sending notification to admins and superadmins:", err);
    return { error: err.message || "An unexpected error occurred" };
  }
};

export const SendNotificationToUser = async ({
  ref_id,
  type,
  title,
  text,
  user_id,
  role,
}) => {
  try {
    const user = await FindUserById_ID(user_id);

    // Create the notification record in the database
    const noti = await prisma.notification.create({
      data: {
        user_id,
        title,
        text,
        ref_id,
        type,
        role,
      },
      select,
    });

    const notificationData = JSON.stringify(noti);
    const carImageUrl = noti?.car_rents?.post?.post_car_image[0]?.url;
    if (user.device_token) {
      const message = {
        notification: {
          title: title,
          body: text,
          image: carImageUrl || undefined, // Attach image if available
        },
        token: user.device_token,
        data: {
          newdata: notificationData,
        },
      };
      messaging.send(message);
    }

    return { message: EMessage.SUCCESS, data: noti };
  } catch (error) {
    console.error("Error sending notification:", error);
    return {
      message: EMessage.ERROR,
      error: error.message || "An unexpected error occurred",
    };
  }
};
export default sendNotificationToAdmin;
