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
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { name } = req.body;
      const car_rent_status = await prisma.car_rent_status.create({
        data: {
          name,
        },
      });
      await RecacheData();
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: car_rent_status,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} car_rent_status`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const statusExists = await FindCar_Rent_StatusById(id);
      if (!statusExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}:car_rent_status`,
          err: "id",
        });
      const status = await prisma.car_rent_status.update({
        where: { id },
        data,
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: status,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} car_rent_status`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const statusExists = await FindCar_Rent_StatusById(id);
      if (!statusExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}:car_rent_status`,
          err: "id",
        });
      const status = await prisma.car_rent_status.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: status,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} car_rent_status`,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      const status = await CachDataNoClear(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: status,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} car_rent_status `,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const status = await FindCar_Rent_StatusById(id);
      if (!status)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}:car_rent_status`,
          err: "id",
        });
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess}`,
        data: status,
      });
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne} car_rent_status`,
        err
      );
    }
  },
};
export default Car_Rent_StatusController;
