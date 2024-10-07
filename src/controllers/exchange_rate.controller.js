import { CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindExChange_rate_Id, FindUserById_ID } from "../services/find";
import { S3UploadImage } from "../services/s3UploadImage";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";

import { DataExists, ValidateExchange_rate } from "../services/validate";
import prisma from "../utils/prisma.client";

const key = "exchange_rate";
const model = "exchange_rate";
const where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
let select;
const ExchagneRateController = {
  async Insert(req, res) {
    try {
      const validate = ValidateExchange_rate(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      let { currency, sell, buy } = req.body;
      const user_id = req.user;
      if (typeof sell !== "number") sell = parseFloat(sell);
      if (typeof buy !== "number") buy = parseFloat(buy);
      const data = req.files;
      if (!data || !data.icon)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "icon",
        });

      const userExists = await FindUserById_ID(user_id);
      if (!userExists || userExists.role === "customer")
        return SendError({
          res,
          statuscode: `${!userExists ? 404 : 400}`,
          message: `${!userExists ? EMessage.notFound : EMessage.notAllow}`,
          err: `${!userExists ? "user_id" : EMessage.notAllow}`,
        });

      const icon = await S3UploadImage(data.icon);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const exchange_rate = await prisma.exchange_rate.create({
        data: {
          currency,
          sell,
          buy,
          icon,
          user_id,
        },
      });

      RecacheData();
      return SendCreate({
        res,
        message: EMessage.insertSuccess,
        data: exchange_rate,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} Exchange rate `,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const user_id = req.user;
      const data = DataExists(req.body);
      if (data.buy && typeof data.buy !== "number")
        data.buy = parseFloat(data.buy);
      if (data.sell && typeof data.sell !== "number")
        data.sell = parseFloat(data.sell);
      const [rateExists, userExists] = await Promise.all([
        FindExChange_rate_Id(id),
        FindUserById_ID(user_id),
      ]);
      if (data.user_id) delete data.user_id;
      if (!rateExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: "id",
        });
      if (!userExists || userExists.role === "customer")
        return SendError({
          res,
          statuscode: `${!userExists ? 404 : 400}`,
          message: `${!userExists ? EMessage.notFound : EMessage.notAllow}`,
          err: `${!userExists ? "user_id" : EMessage.notAllow}`,
        });

      const exchange_rate = await prisma.exchange_rate.update({
        where: {
          id,
        },
        data: {
          ...data,
          user_id,
        },
      });
      RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: exchange_rate,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} Exchange rate `,
        err,
      });
    }
  },
  async UpdateIcon(req, res) {
    try {
      const id = req.params.id;
      const { old_icon } = req.body;
      if (!old_icon)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "old_icon",
        });
      const data = req.files;
      if (!data || !data.icon)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "icon",
        });
      const rateExists = await FindExChange_rate_Id(id);
      if (!rateExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: "id",
        });
      const icon = await S3UploadImage(data.icon, old_icon);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const exchange_rate = await prisma.exchange_rate.update({
        where: {
          id,
        },
        data: {
          icon,
        },
      });

      RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: exchange_rate,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} exchange_rate icon`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const rateExists = await FindExChange_rate_Id(id);
      if (!rateExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: "id",
        });
      const exchange_rate = await prisma.exchange_rate.update({
        where: {
          id,
        },
        data: {
          is_active: false,
        },
      });
      RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: exchange_rate,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} exchange_rate `,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const exchange_rate = await FindExChange_rate_Id(id);
      if (!exchange_rate)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: "id",
        });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: exchange_rate,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne} exchange_rate `,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      const exchange_rate = await CachDataNoClear(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: exchange_rate,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} exchange_rate `,
        err,
      });
    }
  },
};
export default ExchagneRateController;
