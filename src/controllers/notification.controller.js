import { CachDataLimit } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindNotification } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import { ValidateData } from "../services/validate";
import prisma from "../utils/prisma.client";
import { RecacheData } from "./user.controller";

const key = "notification";
const model = "notification";
export let select = {
  id: true,
  is_active: true,
  isNewNoti: true,
  title: true,
  text: true,
  role: true,
  type: true,
  created_at: true,
  updated_at: true,
  car_rents: {
    select: {
      user_id: true,
      frist_name: true,
      last_name: true,
      phone_number: true,
      total_price: true,
      currency: true,
      // jaiykhon: true,
      status: true,
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
          car_brand: true,
          car_version: true,
          car_year: true,
          car_color: true,
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
          err: validate.join(","),
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
      await DeleteCachedKey(noti.user_id + key + noti.type);
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
      await DeleteCachedKey(noti.user_id + key + noti.type);
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
          user_id + key + type + page,
          model,
          { ...where, user_id, type },
          page,
          select,
          [{ isNewNoti: "desc" }, { created_at: "desc" }]
        ),
        CachDataLimit(
          user_id + key + type + page + 1,
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
      let type = req.query.type || "car_rent";
      page = !page || page < 0 ? 0 : page - 1;
      const admin = "admin";
      const [noti] = await Promise.all([
        CachDataLimit(
          admin + key + type + page,
          model,
          { ...where, role: admin, type },
          page,
          select,
          [{ isNewNoti: "desc" }, { created_at: "desc" }]
        ),
        CachDataLimit(
          admin + key + type + page + 1,
          model,
          { ...where, role: admin, type },
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
