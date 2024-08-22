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
const RecacheData = async () => {
  await DeleteCachedKey(key + "*");
  await CachDataAll(key, model, where, select);
  CachDataLimit(key + "-" + "0", model, where, select);
  let id = "";
  FindPromotionById_ID(id);
};

const PromotionController = {
  async Insert(req, res) {
    try {
      const validate = ValidatePromotion(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      let { price, amount } = req.body;
      if (typeof price !== "number") {
        price = parseFloat(price);
      }
      if (typeof amount !== "number") {
        amount = parseInt(amount);
      }
      const code = shortid.generate().toUpperCase();
      console.log("code :>> ", code);
      const promotion = await prisma.promotions.create({
        data: {
          code,
          price,
          amount,
          count_use: amount,
        },
      });
      await RecacheData();
      return SendCreate(res, `${EMessage.insertSuccess} promotion`, promotion);
    } catch (error) {
      SendErrorLog(
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
      if (!promotionExists) {
        return SendError(res, 404, `${EMessage.notFound} promotion not found`);
      }
      const promotion = await prisma.promotions.update({
        where: { id },
        data,
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.updateSuccess} promotion`, promotion);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed}`,
        error
      );
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const promotionExists = await FindPromotionById_ID(id);
      if (!promotionExists) {
        return SendError(res, 404, `${EMessage.notFound} promotion not found`);
      }
      const promotion = await prisma.promotions.update({
        where: { id },
        data: {
          is_active: false,
        },
      });
      await RecacheData();
      return SendSuccess(res, `${EMessage.deleteSuccess} promotion`, promotion);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed}`,
        error
      );
    }
  },

  async SelectAll(req, res) {
    try {
      const promotion = await CachDataAll(key, model, where, select);
      return SendSuccess(
        res,
        `${EMessage.fetchAllSuccess} promotion`,
        promotion
      );
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.fetchAllSuccess}`,
        error
      );
    }
  },
  async SelecOne(req, res) {
    try {
      const id = req.params.id;
      const promotionData = await CachDataAll(key, model, where, select);
      let promotion = promotionData.find((item) => item.id === id);
      if (!promotion) {
        return SendError(res, 404, `${EMessage.notFound} promotion not found`);
      }
      return SendSuccess(
        res,
        `${EMessage.fetchOneSuccess} promotion`,
        promotion
      );
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        error
      );
    }
  },

  async SelectIsPublic(req, res) {
    try {
      const promotionData = await CachDataAll(key, model, where, select);
      let promotion = promotionData.filter((item) => item.is_public === true);
      return SendSuccess(
        res,
        `${EMessage.fetchOneSuccess} promotion`,
        promotion
      );
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        error
      );
    }
  },
  async SelectPage(req, res) {
    try {
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const promotion = await CachDataLimit(
        key + "-" + page,
        model,
        where,
        page,
        select
      );
      CachDataLimit(key + "-" + (page + 1), model, where, page + 1, select);
      return SendSuccess(
        res,
        `${EMessage.fetchOneSuccess} promotion`,
        promotion
      );
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        error
      );
    }
  },
};
export default PromotionController;
