import { CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindLevel_InsurancesById } from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { DataExists, ValidateLevel_Insurances } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "level_insurances";
let model = "level_insurances";
let select;
let where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const Level_InsurancesController = {
  async Insert(req, res) {
    try {
      const validate = ValidateLevel_Insurances(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { name } = req.body;
      const level_insurances = await prisma.level_insurances.create({
        data: {
          name,
        },
      });
      await RecacheData();
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: level_insurances,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} level insurance`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const level_insuranceExists = await FindLevel_InsurancesById(id);
      if (!level_insuranceExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: level insurance`,
          err: "id",
        });
      const level_insurance = await prisma.level_insurances.update({
        where: { id },
        data,
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: level_insurance,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed}`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const level_insuranceExists = await FindLevel_InsurancesById(id);
      if (!level_insuranceExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: level insurance`,
          err: "id",
        });
      const level_insurance = await prisma.level_insurances.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: level_insurance,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} level insurance`,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      const level_insurance = await CachDataNoClear(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: level_insurance,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} level insurance`,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const level_insurance = await FindLevel_InsurancesById(id);
      if (!level_insurance)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: level insurance`,
          err: "id",
        });
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess}`,
        data: level_insurance,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne} level insurance`,
        err,
      });
    }
  },
};
export default Level_InsurancesController;
