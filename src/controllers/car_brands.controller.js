import { CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindCar_BrandsById } from "../services/find";
import { S3UploadImage } from "../services/s3UploadImage";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { UploadImage } from "../services/upload.file";
import { DataExists, ValidateCar_Brands } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "car_brands";
let model = "car_brands";
let select;
let where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const Car_BrandsController = {
  async Insert(req, res) {
    try {
      const validate = ValidateCar_Brands(req.body);
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
      const car_brands = await prisma.car_brands.create({
        data: {
          name,
          icon,
        },
      });
      await RecacheData();
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: car_brands,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} car_brands`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const car_brandsExists = await FindCar_BrandsById(id);
      if (!car_brandsExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: car_brands`,
          err: "id",
        });
      const car_brands = await prisma.car_brands.update({
        where: {
          id,
        },
        data,
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: car_brands,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} car_brands data`,
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
      const car_brandsExists = await FindCar_BrandsById(id);
      if (!car_brandsExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: car_brands`,
          err: "id",
        });
      const icon = await S3UploadImage(data.icon, old_icon);
      if (!icon) {
        throw new Error("upload image failed");
      }
      const car_brands = await prisma.car_brands.update({
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
        data: car_brands,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} car_brands icon`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;

      const car_brandsExists = await FindCar_BrandsById(id);
      if (!car_brandsExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: car_brands`,
          err: "id",
        });
      const car_brands = await prisma.car_brands.update({
        where: {
          id,
        },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: car_brands,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} car_brands`,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      const car_brands = await CachDataNoClear(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: car_brands,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} car_brands`,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;

      const car_brands = await FindCar_BrandsById(id);
      if (!car_brands)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: car_brands`,
          err: "id",
        });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: car_brands,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne} car_brands`,
        err,
      });
    }
  },
};
export default Car_BrandsController;
