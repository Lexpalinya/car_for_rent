import { CachDataAll, CachDataLimit } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import { FindNotification, FindUserById } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import { ValidateData } from "../services/validate";
import prisma from "../utils/prisma.client";
import { RecacheData } from "./user.controller";

const key = "notification";
const model = "notification";
let select;
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
      const user = await FindUserById(user_id);
      if (!user) throw new Error("user not found");
      const message = {
        notification: {
          title,
          detail: text,
        },
        token: user.device_token,
        data: data,
      };
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

      return { message: EMessage.SUCCESS, data: noti };
    } catch (error) {
      return error;
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
      page = !page || page < 0 ? 0 : page - 1;
      const user_id = req.user;
      const [noti] = await Promise.all([
        CachDataLimit(
          user_id + key + page,
          model,
          { ...where, user_id },
          page,
          select,
          [{ isNewNoti: "desc" }, { created_at: "desc" }]
        ),
        CachDataLimit(
          user_id + key + page + 1,
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
          { ...where, role: admin },
          page,
          select,
          [{ isNewNoti: "desc" }, { created_at: "desc" }]
        ),
        CachDataLimit(
          admin + key + page + 1,
          model,
          { ...where, role: admin },
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
