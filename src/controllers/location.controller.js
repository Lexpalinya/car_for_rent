import redis from "../DB/redis";
import { CachDataAll } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import { FindLocationById } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import { DataExists, ValidateLocation } from "../services/validate";
import prisma from "../utils/prisma.client";
let key = "location";
const model = "location";
let select;
let where = { is_active: true };

const LocationController = {
  async Insert(req, res) {
    try {
      const validate = ValidateLocation(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const user_id = req.user;
      const { address, text, detail } = req.body;
      const location = await prisma.location.create({
        data: {
          address,
          text,
          detail,
          user_id,
        },
      });
      await redis.del(user_id + key);
      await CachDataAll(
        user_id + key,
        model,
        {
          user_id,
          is_active: true,
        },
        select
      );
      return SendSuccess({
        res,
        message: `${EMessage.insertSuccess} location`,
        data: location,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverErrorMessage} ${EMessage.insertFailedMessage} location`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const locationExists = await FindLocationById(id);
      if (!locationExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound} location`,
          err: "id",
        });
      const location = await prisma.location.update({ where: { id }, data });
      await redis.del(locationExists.user_id + key);
      await CachDataAll(
        locationExists.user_id + key,
        model,
        {
          user_id: locationExists.user_id,
          is_active: true,
        },
        select
      );
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: location,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverErrorMessage} ${EMessage.updateFailed} location`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const locationExists = await FindLocationById(id);
      if (!locationExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound} location`,
          err: "id",
        });
      const location = await prisma.location.update({
        where: { id },
        data: { is_active: false },
      });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: location,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverErrorMessage} ${EMessage.deleteFailed} location`,
        err,
      });
    }
  },
  async SelectByUser(req, res) {
    try {
      const user_id = req.user;
      const location = await CachDataAll(
        user_id + key,
        model,
        {
          user_id,
          is_active: true,
        },
        select
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: location,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverErrorMessage} ${EMessage.fetchAllSuccess} location`,
        err,
      });
    }
  },
};
export default LocationController;
