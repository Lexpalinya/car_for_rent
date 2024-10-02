import { CachDataAll, CachDataLimit } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import { FindNotification, FindUserById } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import { ValidateData } from "../services/validate";
import prisma from "../utils/prisma.client";
import { RecacheData } from "./user.controller";
import messaging from "../config/firebase.Admin";
const key = "notification";
const model = "notification";
let select = {
  id: true,
  is_active: true,
  isNewNoti: true,
  title: true,
  text: true,
  role: true,
  type: true,
  car_rents: {
    where: {
      is_active: true,
    },
    select: {
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
            post_car_image: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    },
  },
};
const where = { is_active: true };
const NotificationController = {
  async saveRegisterToken(req, res) {
    try {
      const user_id = req.user;
      const { registerToken } = req.body;
      const validate = ValidateData({ registerToken, user_id });
      if (validate.length > 0)
        return SendError({
          res,
          message: EMessage.pleaseInput,
          error: validate.join(","),
        });
      const user = await prisma.users.update({
        where: {
          id: user_id,
        },
        data: {
          device_token: registerToken,
        },
      });
      await RecacheData(user.id, { page: true });
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess} user save device token`,
        data: user,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} save device token`,
        err,
      });
    }
  },
  async readNoti(req, res) {
    try {
      const id = req.params.id;
      const notiExists = await FindNotification(id);
      if (!notiExists)
        return SendError({
          res,
          message: `${EMessage.notFound} notification `,
          error: "id notification",
        });
      const noti = await prisma.notification.update({
        where: {
          id,
        },
        data: {
          isNewNoti: false,
        },
      });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: noti,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed}delete notification`,
        err,
      });
    }
  },

  async Delete(req, res) {
    try {
      const id = req.params.id;
      const notiExists = await FindNotification(id);
      if (!notiExists)
        return SendError({
          res,
          message: `${EMessage.notFound} notification `,
          error: "id notification",
        });
      const noti = await prisma.notification.update({
        where: {
          id,
        },
        data: {
          is_active: false,
        },
      });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: noti,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed}delete notification`,
        err,
      });
    }
  },
  async notiNew({ data, ref_id, type, title, text, user_id, role }) {
    try {
      // Find the user by ID
      const user = await FindUserById(user_id);
      if (!user) throw new Error("User not found");

      // Construct the notification message
      const message = {
        notification: {
          title,
          body: text, // Changed 'detail' to 'body' for FCM compatibility
        },
        token: user.device_token,
        // Uncomment the following line if you need to send additional data
        data: data,
      };

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
      });

      // Send the notification and await the response
      const response = await messaging.send(message);
      console.log("Successfully sent message:", response);

      return { message: EMessage.SUCCESS, data: noti };
    } catch (error) {
      console.error("Error sending notification:", error);
      return {
        message: EMessage.ERROR,
        error: error.message || "An error occurred",
      };
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const noti = await FindNotification(id);
      if (!noti)
        return SendError({
          res,
          message: `${EMessage.notFound} notification `,
          error: "id notification",
        });

      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess}`,
        data: noti,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne}delete notification`,
        err,
      });
    }
  },
  async SelectNotiByUser_id(req, res) {
    try {
      let page = parseInt(req.query.page);
      let type = req.query.type;
      page = !page || page < 0 ? 0 : page - 1;
      const user_id = req.user;
      const [noti] = await Promise.all([
        CachDataLimit(
          user_id + key + page + type,
          model,
          { ...where, user_id, type },
          page,
          select,
          [{ isNewNoti: "desc" }, { created_at: "desc" }]
        ),
        CachDataLimit(
          user_id + key + page + type + 1,
          model,
          { ...where, user_id },
          page + 1,
          select,
          [{ isNewNoti: "desc" }, { created_at: "desc" }]
        ),
      ]);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: noti,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} notification by user_id`,
        err,
      });
    }
  },
  async SelectByAdmin(req, res) {
    try {
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const admin = "admin";
      const [noti] = await Promise.all([
        CachDataLimit(
          admin + key + page,
          model,
          { ...where, role: admin, type: "car_rent" },
          page,
          select,
          [{ isNewNoti: "desc" }, { created_at: "desc" }]
        ),
        CachDataLimit(
          admin + key + page + 1,
          model,
          { ...where, role: admin, type: "car_rent" },
          page + 1,
          select,
          [{ isNewNoti: "desc" }, { created_at: "desc" }]
        ),
      ]);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: noti,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} notification by admin`,
        err,
      });
    }
  },
};
export default NotificationController;
