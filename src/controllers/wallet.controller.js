import redis from "../DB/redis";
import { CachDataAll, CachDataLimit } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import {
  FindPromotionById_ID,
  FindUserById_ID,
  FindWalletById,
} from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { DataExists, ValidateWallet } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "wallets";
let model = "wallet";
let where = { is_active: true };
let select = {
  id: true,
  user_id: true,
  promotion_id: true,
  created_at: true,
  updated_at: true,
  users: {
    select: {
      username: true,
    },
  },
  promotions: true,
};
const WalletController = {
  async Insert(req, res) {
    try {
      const validate = ValidateWallet(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { user_id, promotion_id } = req.body;
      const [userExists, promotionExists] = await Promise.all([
        FindUserById_ID(user_id),
        FindPromotionById_ID(promotion_id),
      ]);
      if (!userExists || !promotionExists)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.notFound} `,
          err: `:${!userExists ? "user id" : "promotion id"}`,
        });
      if (promotionExists.amount < 1) {
        return SendError({
          res,
          statuscode: 400,
          message: `The promotion code:${promotionExists.code} is over `,
          err: "promotion out",
        });
      }
      const wallet = await prisma.wallet.create({
        data: {
          user_id,
          promotion_id,
        },
        select,
      });
      const promotion = await prisma.promotions.update({
        where: { id: promotion_id },
        data: { amount: promotionExists.amount - 1 },
      });

      await redis.del(user_id + key, promotion_id + key);
      await DeleteCachedKey("promotions");

      await DeleteCachedKey(key);
      await CachDataAll(key, model, where, select);

      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: wallet,
      });
    } catch (error) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} wallet`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;

      // Validate and clean up the input data
      const data = DataExists(req.body);

      // Initialize an array of promises to validate relationships
      const promises = [FindWalletById(id)];
      if (data.user_id) promises.push(FindUserById_ID(data.user_id));
      if (data.promotion_id)
        promises.push(FindPromotionById_ID(data.promotion_id));

      // Await all promises simultaneously for better performance
      const [walletExists, userExists, promotionExists] = await Promise.all(
        promises
      );

      // Handle cases where required data does not exist
      if (
        !walletExists ||
        (data.user_id && !userExists) ||
        (data.promotion_id && !promotionExists)
      ) {
        const missingEntity = !walletExists
          ? "wallet"
          : data.user_id && !userExists
          ? "user"
          : "promotion";
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: ` ${missingEntity} id`,
        });
      }

      // Proceed with updating the wallet
      const updatedWallet = await prisma.wallet.update({
        where: { id },
        data,
      });

      // Send success response with the updated wallet data
      return SendSuccess({
        res,
        message: EMessage.updateSuccess,
        data: updatedWallet,
      });
    } catch (err) {
      // Log the error and send an appropriate response
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} wallet`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const walletExists = await FindWalletById(id);
      if (!walletExists) {
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}:wallet`,
          err: "id",
        });
      }
      const wallet = await prisma.wallet.update({
        where: { id },
        data: {
          is_active: false,
        },
      });
      await redis.del(
        walletExists.user_id + key,
        walletExists.promotion_id + key
      );
      // await DeleteCachedKey("promotions");

      await DeleteCachedKey(key);
      await CachDataAll(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: wallet,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} wallet`,
        err,
      });
    }
  },

  async SelectByUserID(req, res) {
    try {
      const id = req.user;
      const wallet = await CachDataAll(
        id + key,
        model,
        { is_active: true, user_id: id },
        select
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: wallet,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} wallet by user`,
        err,
      });
    }
  },
  async SelectByPromotionID(req, res) {
    try {
      const id = req.params.id;
      const wallet = await CachDataAll(
        id + key,
        model,
        { is_active: true, promotion_id: id },
        select
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: wallet,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} wallet by promotion id`,
        err,
      });
    }
  },
  async SelectAllPage(req, res) {
    try {
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const wallet = await CachDataLimit(
        key + "-" + page,
        model,
        where,
        page,
        select
      );
      CachDataLimit(key + "-" + (page + 1), model, where, page + 1, select);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess} wallet`,
        data: wallet,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} wallet page`,
        err,
      });
    }
  },
};
export default WalletController;
