import { CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindCar_typesById } from "../services/find";
import { S3UploadImage } from "../services/s3UploadImage";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { UploadImage } from "../services/upload.file";
import { DataExists, ValidateCar_Types } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "car_types";
let model = "car_types";
let select;
let where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const Car_typesController = {
  async Insert(req, res) {
    try {
      const validate = ValidateCar_Types(req.body);
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
      let { nameLao, nameEng, nameChi, nameRok, detail, wheel, commition } =
        req.body;
      const icon = await S3UploadImage(data.icon);
      if (!icon) {
        throw new Error("upload image failed");
      }
      if (typeof commition !== "number") commition = parseFloat(commition);
      const car_type = await prisma.car_types.create({
        data: {
          detail,
          wheel,
          nameLao,
          nameEng,
          nameChi,
          nameRok,
          icon,
          commition,
        },
      });
      await RecacheData();
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: car_type,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} car_type`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const car_typeExists = await FindCar_typesById(id);
      if (data.commition && typeof data.commition !== "number")
        data.commition = parseFloat(data.commition);
      if (!car_typeExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: car_type`,
          err: "id",
        });
      const car_type = await prisma.car_types.update({
        where: {
          id,
        },
        data,
      });
      await RecacheData();
      return SendCreate({
        res,
        message: `${EMessage.updateSuccess}`,
        data: car_type,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} car_type data`,
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
      const car_typeExists = await FindCar_typesById(id);
      if (!car_typeExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: car_type`,
          err: "id",
        });
      const icon = await S3UploadImage(data.icon, old_icon);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const car_type = await prisma.car_types.update({
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
        data: car_type,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} car_type icon`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;

      const car_typeExists = await FindCar_typesById(id);
      if (!car_typeExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: car_type`,
          err: "id",
        });
      const car_type = await prisma.car_types.update({
        where: {
          id,
        },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: car_type,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} car_type`,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      const car_type = await CachDataNoClear(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: car_type,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.fetchAllSuccess}`,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;

      const car_type = await FindCar_typesById(id);
      if (!car_type)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: car_type`,
          err: "id",
        });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: car_type,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed}`,
        err,
      });
    }
  },
};
export default Car_typesController;
