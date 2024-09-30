import { CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindPayment_qrById } from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { UploadImage } from "../services/upload.file";
import { DataExists, ValidatePayment_qr } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "payment_qr";
let model = "payment_qr";
let select;
let where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const Payment_qrController = {
  async Insert(req, res) {
    try {
      const validate = ValidatePayment_qr(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const data = req.files;
      if (!data || !data.qr)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "qr",
        });
      const { currency } = req.body;
      const user_id = req.user;

      const qr = await UploadImage(data.qr.data);
      if (!qr) {
        throw new Error("upload image failed");
      }
      const payment_qr = await prisma.payment_qr.create({
        data: {
          user_id,
          currency,
          qr,
        },
      });
      await RecacheData();
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: payment_qr,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} payment_qr`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const payment_qrExsists = await FindPayment_qrById(id);
      if (!payment_qrExsists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: payment_qr`,
          err: "id",
        });
      const payment_qr = await prisma.payment_qr.update({
        where: {
          id,
        },
        data,
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: payment_qr,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} payment_qr data`,
        err,
      });
    }
  },
  async UpdateQr(req, res) {
    try {
      const id = req.params.id;
      const { old_qr } = req.body;
      const user_id = req.user;
      if (!old_qr)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "old_qr",
        });
      const data = req.files;
      if (!data || !data.qr)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "qr",
        });
      const payment_qrExsists = await FindPayment_qrById(id);
      if (!payment_qrExsists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: payment_qr`,
          err: "id",
        });
      const qr = await UploadImage(data.qr.data, old_qr);
      if (!qr) {
        throw new Error("upload image failed");
      }
      const payment_qr = await prisma.payment_qr.update({
        where: {
          id,
        },
        data: {
          qr,
          user_id,
        },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: payment_qr,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} payment_qr qr`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const user_id = req.user;

      const payment_qrExsists = await FindPayment_qrById(id);
      if (!payment_qrExsists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: payment_qr`,
          err: "id",
        });
      const payment_qr = await prisma.payment_qr.update({
        where: {
          id,
        },
        data: { is_active: false, user_id },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: payment_qr,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} payment_qr`,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      const payment_qr = await CachDataNoClear(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: payment_qr,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} payment_qr`,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;

      const payment_qr = await FindPayment_qrById(id);
      if (!payment_qr)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: payment_qr`,
          err: "id",
        });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: payment_qr,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne} payment_qr`,
        err,
      });
    }
  },
};
export default Payment_qrController;
