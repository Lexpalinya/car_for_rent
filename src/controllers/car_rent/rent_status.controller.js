import { CachDataAll, CachDataNoClear } from "../../services/cach.contro";
import { DeleteCachedKey } from "../../services/cach.deletekey";
import { EMessage } from "../../services/enum";
import { FindCar_Rent_StatusById } from "../../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../../services/services";
import { DataExists, ValidateCar_Rent_Status } from "../../services/validate";
import prisma from "../../utils/prisma.client";

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
      let {
        nameTenantLao,
        nameTenantEng,
        nameTenantChi,
        nameTenantRok,
        namePostertLao,
        namePostertEng,
        namePostertChi,
        namePostertRok,
        priority,
      } = req.body;
      if (typeof priority !== "number") priority = parseInt(priority, 10);
      const car_rent_status = await prisma.car_rent_status.create({
        data: {
          nameTenantLao,
          nameTenantEng,
          nameTenantChi,
          nameTenantRok,
          namePostertLao,
          namePostertEng,
          namePostertChi,
          namePostertRok,
          priority,
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
      if (data.priority && typeof data.priority !== "number")
        data.priority = parseInt(data.priority, 10);
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
  async SelectShowUserRent(req, res) {
    try {
      const car_rent_user = await CachDataAll(
        key + "showUserRent",
        model,
        {
          is_active: true,
          priority: {
            gte: 1,
            lte: 5,
          },
        },
        select,
        {
          priority: "asc",
        }
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: car_rent_user,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.fetchOneSuccess} show_user_rent_status`,
      });
    }
  },
  async SelectShowUserPost(req, res) {
    try {
      const car_rent_user = await CachDataAll(
        key + "showUserPost",
        model,
        {
          is_active: true,
          priority: {
            gte: 2,
            lte: 5,
          },
        },
        select,
        {
          priority: "asc",
        }
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: car_rent_user,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.fetchOneSuccess} show_user_rent_status`,
      });
    }
  },
  async SelectShowHistory(req, res) {
    try {
      const car_rent_user = await CachDataAll(
        key + "showHistory",
        model,
        {
          is_active: true,
          priority: {
            gte: 6,
            lte: 10,
          },
        },
        select,
        {
          priority: "asc",
        }
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: car_rent_user,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.fetchOneSuccess} show_user_rent_status`,
      });
    }
  },
};
export default Car_Rent_StatusController;
