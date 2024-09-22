import { CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindLablesById } from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { UploadImage } from "../services/upload.file";
import { DataExists, ValidateLabels } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "labels";
let model = "labels";
let select;
let where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const LabelsController = {
  async Insert(req, res) {
    try {
      const validate = ValidateLabels(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const data = req.files;
      if (!data || !data.icon)
        return SendError(res, 400, `${EMessage.pleaseInput}: icon`);
      const { name } = req.body;
      const icon = await UploadImage(data.icon.data);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const label = await prisma.labels.create({
        data: {
          name,
          icon,
        },
      });
      await RecacheData();
      return SendCreate(res, `${EMessage.insertSuccess}`, label);
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed}`,
        err
      );
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const labelsExists = await FindLablesById(id);
      if (!labelsExists)
        return SendError(res, 404, `${EMessage.notFound}: label id`);
      const label = await prisma.labels.update({
        where: {
          id,
        },
        data,
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.updateSuccess}`, label);
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed}`,
        err
      );
    }
  },
  async UpdateIcon(req, res) {
    try {
      const id = req.params.id;
      const { old_icon } = req.body;
      if (!old_icon)
        return SendError(res, 400, `${EMessage.pleaseInput}:old_icon`);
      const data = req.files;
      if (!data || !data.icon)
        return SendError(res, 400, `${EMessage.pleaseInput}: icon`);
      const labelsExists = await FindLablesById(id);
      if (!labelsExists)
        return SendError(res, 404, `${EMessage.notFound}: label id`);
      const icon = await UploadImage(data.icon.data, old_icon);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const label = await prisma.labels.update({
        where: {
          id,
        },
        data: {
          icon,
        },
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.updateSuccess}`, label);
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed}`,
        err
      );
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;

      const labelsExists = await FindLablesById(id);
      if (!labelsExists)
        return SendError(res, 404, `${EMessage.notFound}: label id`);
      const label = await prisma.labels.update({
        where: {
          id,
        },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.deleteSuccess}`, label);
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed}`,
        err
      );
    }
  },
  async SelectAll(req, res) {
    try {
      const label = await CachDataNoClear(key, model, where, select);
      return SendSuccess(res, `${EMessage.fetchAllSuccess}`, label);
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.fetchAllSuccess}`,
        err
      );
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;

      const label = await FindLablesById(id);
      if (!label) return SendError(res, 404, `${EMessage.notFound}: label id`);
      return SendSuccess(res, `${EMessage.deleteSuccess}`, label);
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed}`,
        err
      );
    }
  },
};
export default LabelsController;
