import { CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindType_of_FualsById } from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { UploadImage } from "../services/upload.file";
import { DataExists, ValidateType_of_Fuals } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "type_of_fuals";
let model = "type_of_fuals";
let select;
let where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const Type_of_FualsController = {
  async Insert(req, res) {
    try {
      const validate = ValidateType_of_Fuals(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}:${validate.Join(", ")}`
        );
      const { name } = req.body;
      const data = req.files;
      if (!data || !data.icon)
        return SendError(res, 400, `${EMessage.pleaseInput}: icon`);
      const icon = await UploadImage(data.icon.data);
      if (!icon) {
        throw new Error("upload image failed");
      }

      const type_of_fuals = await prisma.type_of_fuals.create({
        data: {
          name,
          icon,
        },
      });
      await RecacheData();
      return SendCreate(res, `${EMessage.insertSuccess}`, type_of_fuals);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed}`,
        error
      );
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const type_of_fualsExists = await FindType_of_FualsById(id);
      if (!type_of_fualsExists)
        return SendError(res, 404, `${EMessage.notFound}:type_of_fuals id`);
      const type_of_fuals = await prisma.type_of_fuals.update({
        where: { id },
        data,
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.updateSuccess}`, type_of_fuals);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed}`,
        error
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
      const type_of_fualsExists = await FindType_of_FualsById(id);
      if (!type_of_fualsExists)
        return SendError(res, 404, `${EMessage.notFound}:type_of_fuals id`);
      const icon = await UploadImage(data.icon.data, old_icon);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const type_of_fuals = await prisma.type_of_fuals.update({
        where: { id },
        data: {
          icon,
        },
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.updateSuccess}`, type_of_fuals);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed}`,
        error
      );
    }
  },

  async Delete(req, res) {
    try {
      const id = req.params.id;
      const type_of_fualsExists = await FindType_of_FualsById(id);
      if (!type_of_fualsExists)
        return SendError(res, 404, `${EMessage.notFound}:type_of_fuals id`);
      const type_of_fuals = await prisma.type_of_fuals.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.deleteSuccess}`, type_of_fuals);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed}`,
        error
      );
    }
  },
  async SelectAll(req, res) {
    try {
      const type_of_fuals = await CachDataNoClear(key, model, where, select);
      return SendSuccess(res, `${EMessage.fetchAllSuccess}`, type_of_fuals);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll} }`,
        error
      );
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const type_of_fuals = await FindType_of_FualsById(id);
      if (!type_of_fuals)
        return SendError(res, 404, `${EMessage.notFound}:type_of_fuals id`);
      return SendSuccess(res, `${EMessage.fetchOneSuccess}`, type_of_fuals);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        error
      );
    }
  },
};
export default Type_of_FualsController;
