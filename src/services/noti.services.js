import messaging from "../config/firebase.Admin";
import prisma from "../utils/prisma.client";
import { CachDataAll } from "./cach.contro";
import { EMessage } from "./enum";
import { FindUserById, FindUserById_ID } from "./find";

const select = {
  id: true,
  is_active: true,
  isNewNoti: true,
  title: true,
  text: true,
  role: true,
  type: true,
  car_rents: {
    select: {
      user_id: true,
      frist_name: true,
      last_name: true,
      total_price: true,
      // jaiykhon: true,
      post: {
        select: {
          id: true,
          user_id: true,
          star: true,
          users: {
            select: {
              profile: true,
              kycs: {
                where: {
                  is_active: true,
                },
                select: {
                  first_name: true,
                  last_name: true,
                  village: true,
                  district: true,
                  province: true,
                  phone_number: true,
                },
              },
            },
          },
          post_car_image: {
            select: {
              url: true, // Fetching the car image URL
            },
          },
        },
      },
    },
  },
};
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
    const message = {
      notification: {
        title,
        body: text, // Body instead of detail for FCM compatibility
        imageUrl: carImageUrl, // Optional image for notification
      },
      token: user.device_token,
      // data: {
      //   id: noti.id,
      //   title: noti.title,
      //   text: noti.text,
      //   role: noti.role,
      //   type: noti.type,
      //   is_active: noti.is_active,
      //   isNewNoti: noti.isNewNoti,
      //   car_image: carImageUrl, // Including car image URL in data payload
      // },
    };

    // Log the message structure
    console.log("Message to be sent :>> ", message);

    // Send the notification via Firebase Messaging
    const response = await messaging.send(message);
    console.log("Successfully sent message:", response);

    // Return success response
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
