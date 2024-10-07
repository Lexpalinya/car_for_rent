import { CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindInsurance_CompanysById } from "../services/find";
import { S3UploadImage } from "../services/s3UploadImage";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { DataExists, ValidateInsurances_Companies } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "insurance_companies";
let model = "insurance_companies";
let select;
let where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const Insurance_companysController = {
  async Insert(req, res) {
    try {
      const validate = ValidateInsurances_Companies(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const data = req.files;
      if (!data || !data.icon)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "icon",
        });
      const { name } = req.body;
      const icon = await S3UploadImage(data.icon);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const companies = await prisma.insurance_companies.create({
        data: {
          name,
          icon,
        },
      });
      await RecacheData();
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: companies,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} insurance companies`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const insurance_companysExists = await FindInsurance_CompanysById(id);
      if (!insurance_companysExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: companies`,
          err: "id",
        });
      const companies = await prisma.insurance_companies.update({
        where: {
          id,
        },
        data,
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: companies,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} insurance companies`,
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
      const insurance_companysExists = await FindInsurance_CompanysById(id);
      if (!insurance_companysExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: companies`,
          err: "id",
        });
      const icon = await S3UploadImage(data.icon, old_icon);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const companies = await prisma.insurance_companies.update({
        where: {
          id,
        },
        data: {
          icon,
        },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: companies,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} insurance_companies`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;

      const insurance_companysExists = await FindInsurance_CompanysById(id);
      if (!insurance_companysExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: companies`,
          err: "id",
        });
      const companies = await prisma.insurance_companies.update({
        where: {
          id,
        },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: companies,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} insurance_companies`,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      const companies = await CachDataNoClear(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: companies,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} insurance_companies`,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;

      const companies = await FindInsurance_CompanysById(id);
      if (!companies)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: companies`,
          err: "id",
        });
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess}`,
        data: companies,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne} insurance_companies`,
        err,
      });
    }
  },
};
export default Insurance_companysController;
