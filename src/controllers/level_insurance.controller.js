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
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}:${validate.join(", ")}`
        );
      const { name } = req.body;
      const level_insurances = await prisma.level_insurances.create({
        data: {
          name,
        },
      });
      await RecacheData();
      return SendCreate(res, `${EMessage.insertSuccess}`, level_insurances);
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
      const level_insuranceExists = await FindLevel_InsurancesById(id);
      if (!level_insuranceExists)
        return SendError(res, 404, `${EMessage.notFound}:level_insurances id`);
      const level_insurance = await prisma.level_insurances.update({
        where: { id },
        data,
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.updateSuccess}`, level_insurance);
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
      const level_insuranceExists = await FindLevel_InsurancesById(id);
      if (!level_insuranceExists)
        return SendError(res, 404, `${EMessage.notFound}:level_insurances id`);
      const level_insurance = await prisma.level_insurances.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.deleteSuccess}`, level_insurance);
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
      const level_insurance = await CachDataNoClear(key, model, where, select);
      return SendSuccess(res, `${EMessage.fetchAllSuccess}`, level_insurance);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll}`,
        error
      );
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const level_insurance = await FindLevel_InsurancesById(id);
      if (!level_insurance)
        return SendError(res, 404, `${EMessage.notFound}:level_insurances id`);
      return SendSuccess(res, `${EMessage.fetchOneSuccess}`, level_insurance);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        error
      );
    }
  },
};
export default Level_InsurancesController;
