import { CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindCar_BrandsById } from "../services/find";
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
      const car_brands = await prisma.car_brands.create({
        data: {
          name,
          icon,
        },
      });
      await RecacheData();
      return SendCreate(res, `${EMessage.insertSuccess}`, car_brands);
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
      const car_brandsExists = await FindCar_BrandsById(id);
      if (!car_brandsExists)
        return SendError(res, 404, `${EMessage.notFound}: car_brands id`);
      const car_brands = await prisma.car_brands.update({
        where: {
          id,
        },
        data,
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.updateSuccess}`, car_brands);
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
      const car_brandsExists = await FindCar_BrandsById(id);
      if (!car_brandsExists)
        return SendError(res, 404, `${EMessage.notFound}: car_brands id`);
      const icon = await UploadImage(data.icon.data, old_icon);
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
      return SendSuccess(res, `${EMessage.updateSuccess}`, car_brands);
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

      const car_brandsExists = await FindCar_BrandsById(id);
      if (!car_brandsExists)
        return SendError(res, 404, `${EMessage.notFound}: car_brands id`);
      const car_brands = await prisma.car_brands.update({
        where: {
          id,
        },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.deleteSuccess}`, car_brands);
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
      const car_brands = await CachDataNoClear(key, model, where, select);
      return SendSuccess(res, `${EMessage.fetchAllSuccess}`, car_brands);
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

      const car_brands = await FindCar_BrandsById(id);
      if (!car_brands)
        return SendError(res, 404, `${EMessage.notFound}: car_brands id`);
      return SendSuccess(res, `${EMessage.deleteSuccess}`, car_brands);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed}`,
        error
      );
    }
  },
};
export default Car_BrandsController;
