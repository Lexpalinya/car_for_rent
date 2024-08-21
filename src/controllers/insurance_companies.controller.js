import { CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindInsurance_CompanysById } from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { UploadImage } from "../services/upload.file";
import { DataExists, ValidateInsurances_Companies } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "insurance_companys";
let model = "insurance_companys";
let select;
let where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const insurance_companysController = {
  async Insert(req, res) {
    try {
      const validate = ValidateInsurances_Companies(req.body);
      if (validate.length > 0)
        return SendError(
          re,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const data = req.files;
      if (!data || !data.icon)
        return SendError(
          re,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const { name } = req.body;
      const icon = await UploadImage(data.icon.data);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const companies = await prisma.insurance_companys.create({
        data: {
          name,
          icon,
        },
      });
      await RecacheData();
      return SendCreate(res, `${EMessage.insertSuccess}`, companies);
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
      const insurance_companysExists = await FindInsurance_CompanysById(id);
      if (!insurance_companysExists)
        return SendError(res, 404, `${EMessage.notFound}: companies id`);
      const companies = await prisma.insurance_companys.update({
        where: {
          id,
        },
        data,
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.updateSuccess}`, companies);
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
        return SendError(
          re,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const insurance_companysExists = await FindInsurance_CompanysById(id);
      if (!insurance_companysExists)
        return SendError(res, 404, `${EMessage.notFound}: companies id`);
      const icon = await UploadImage(data.icon.data, old_icon);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const companies = await prisma.insurance_companys.update({
        where: {
          id,
        },
        data: {
          icon,
        },
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.updateSuccess}`, companies);
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

      const insurance_companysExists = await FindInsurance_CompanysById(id);
      if (!insurance_companysExists)
        return SendError(res, 404, `${EMessage.notFound}: companies id`);
      const companies = await prisma.insurance_companys.update({
        where: {
          id,
        },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.deleteSuccess}`, companies);
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
      const companies = await CachDataNoClear(key, model, where, select);
      return SendSuccess(res, `${EMessage.fetchAllSuccess}`, companies);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.fetchAllSuccess}`,
        error
      );
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;

      const companies = await FindInsurance_CompanysById(id);
      if (!companies)
        return SendError(res, 404, `${EMessage.notFound}: companies id`);
      return SendSuccess(res, `${EMessage.deleteSuccess}`, companies);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed}`,
        error
      );
    }
  },
};
export default insurance_companysController;
