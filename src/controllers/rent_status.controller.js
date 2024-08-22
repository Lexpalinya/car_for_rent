import { CachDataAll, CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindCar_Rent_StatusById } from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { DataExists, ValidateCar_Rent_Status } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "car_rent_status";
let model = "car_rent_status";
let select;
let where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const Car_Rent_StatusController = {
  async Insert(req, res) {
    try {
      const validate = ValidateCar_Rent_Status(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}:${validate.join(", ")}`
        );
      const { name } = req.body;
      const car_rent_status = await prisma.car_rent_status.create({
        data: {
          name,
        },
      });
      await RecacheData();
      return SendCreate(res, `${EMessage.insertSuccess}`, car_rent_status);
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
      const statusExists = await FindCar_Rent_StatusById(id);
      if (!statusExists)
        return SendError(res, 404, `${EMessage.notFound}:car_rent_status id`);
      const status = await prisma.car_rent_status.update({
        where: { id },
        data,
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.updateSuccess}`, status);
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
      const statusExists = await FindCar_Rent_StatusById(id);
      if (!statusExists)
        return SendError(res, 404, `${EMessage.notFound}:car_rent_status id`);
      const status = await prisma.car_rent_status.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.deleteSuccess}`, status);
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
      const status = await CachDataNoClear(key, model, where, select);
      return SendSuccess(res, `${EMessage.fetchAllSuccess}`, status);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll} `,
        error
      );
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const status = await FindCar_Rent_StatusById(id);
      if (!status)
        return SendError(res, 404, `${EMessage.notFound}:car_rent_status id`);
      return SendSuccess(res, `${EMessage.fetchOneSuccess}`, status);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        error
      );
    }
  },
};
export default Car_Rent_StatusController;
