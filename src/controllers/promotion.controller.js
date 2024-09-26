import { EMessage } from "../services/enum";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { DataExists, ValidatePromotion } from "../services/validate";
import shortid from "shortid";
import prisma from "../utils/prisma.client";
import { CachDataAll, CachDataLimit } from "../services/cach.contro";
import { FindPromotionById_ID } from "../services/find";
import { DeleteCachedKey } from "../services/cach.deletekey";

let key = "promotions";
let model = "promotions";
let where = { is_active: true };
let select;
export const RecacheDataPromotion = async ({ key, key_id }) => {
  let promiselist = [DeleteCachedKey(key)];
  if (key_id) {
    promiselist.push(DeleteCachedKey(key_id));
  }
  await Promise.all(promiselist);
};

const PromotionController = {
  async Insert(req, res) {
    try {
      const validate = ValidatePromotion(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      let { title, price, amount, out_date } = req.body;
      if (typeof price !== "number") {
        price = parseFloat(price);
      }
      if (typeof amount !== "number") {
        amount = parseInt(amount);
      }
      const code = shortid.generate().toUpperCase();

      const promotion = await prisma.promotions.create({
        data: {
          title,
          code,
          price,
          amount,
          count_use: amount,
          out_date,
        },
      });
      await RecacheDataPromotion({ key });
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess} promotion`,
        data: promotion,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} promotion`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      if (data.is_public && typeof data.is_public !== "boolean") {
        data.is_public = data.is_public === "true" ? true : false;
      }
      if (data.price && typeof data.price !== "number") {
        data.price = parseFloat(data.price);
      }
      if (data.amount && typeof data.amount !== "number") {
        data.amount = parseInt(data.amount);
      }
      if (data.count_use && typeof data.count_use !== "number") {
        data.count_use = parseInt(data.count_use);
      }
      const promotionExists = await FindPromotionById_ID(id);
      if (!promotionExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: promotion`,
          err: "id",
        });
      const promotion = await prisma.promotions.update({
        where: { id },
        data,
      });
      await RecacheDataPromotion({ key, key_id: id + key });
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: promotion,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} promtion`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const promotionExists = await FindPromotionById_ID(id);
      if (!promotionExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: promotion`,
          err: "id",
        });
      const promotion = await prisma.promotions.update({
        where: { id },
        data: {
          is_active: false,
        },
      });
      await RecacheDataPromotion({ key, key_id: id + key });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: promotion,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} promotion`,
        err,
      });
    }
  },

  // async SelectAll(req, res) {
  //   try {
  //     const promotion = await CachDataAll(key, model, where, select);
  //     return SendSuccess({
  //       res,
  //       message: `${EMessage.fetchAllSuccess} promotion`,
  //       data: promotion,
  //     });
  //   } catch (err) {
  //     SendErrorLog({
  //       res,
  //       message: `${EMessage.serverError} ${EMessage.errorFetchingAll} promotion`,
  //       err,
  //     });
  //   }
  // },
  async SelecOne(req, res) {
    try {
      const id = req.params.id;
      const promotion = await FindPromotionById_ID(id);
      if (!promotion)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: promotion`,
          err: "id",
        });
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess} promotion`,
        data: promotion,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        err,
      });
    }
  },

  async SelectIsPublic(req, res) {
    try {
      const promotion = await CachDataAll(
        key,
        model,
        { is_public: true, ...where },
        select
      );

      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess} by isPublic`,
        data: promotion,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne} promotion by isPublic`,
        err,
      });
    }
  },
  async SelectPage(req, res) {
    try {
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const [promotion] = await Promise.all([
        CachDataLimit(key + "-" + page, model, where, page, select),
        CachDataLimit(key + "-" + (page + 1), model, where, page + 1, select),
      ]);
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess} promotion`,
        data: promotion,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} promotion page`,
        err,
      });
    }
  },
};
export default PromotionController;
