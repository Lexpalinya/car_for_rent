import { EMessage } from "../services/enum";
import { FindUserById } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import { ValidateData } from "../services/validate";
import prisma from "../utils/prisma.client";
import { RecacheData } from "./user.controller";

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
    } catch (error) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed}delete notification`,
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
    } catch (error) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed}delete notification`,
      });
    }
  },
  async notiNew({ data, ref_id, type, title, text, user_id, role }) {
    try {
      const user = await FindUserById(user_id);
      const message = {
        notification: {
          title,
          detail: text,
        },
        token: user.device_token,
        data: data,
      };
      await prisma.notification.create({
        data: {
          user_id,
          title,
          text,
          ref_id,
          type,
          role,
        },
      });

      return EMessage.SUCCESS;
    } catch (error) {
      return error;
    }
  },
};
export default NotificationController;
