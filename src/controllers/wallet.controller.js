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
import { RecacheDataPromotion } from "./promotion.controller";

let key = "wallets";
let model = "wallet";
let where = { is_active: true };
let select = {
  id: true,
  user_id: true,
  promotion_id: true,
  // title: true,
  is_use: true,
  created_at: true,
  updated_at: true,
  users: {
    select: {
      username: true,
    },
  },
  promotions: true,
};
export const RecacheDataWallet = async ({
  key,
  key_user_id,
  key_promotion_id,
}) => {
  let promises = [
    DeleteCachedKey(key),
    redis.del([key_user_id, key_promotion_id]),
  ];

  await Promise.all(promises);
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
      const [wallet] = await Promise.all([
        prisma.wallet.create({
          data: {
            user_id,
            promotion_id,
          },
          select,
        }),
        prisma.promotions.update({
          where: { id: promotion_id },
          data: { amount: promotionExists.amount - 1 },
        }),
      ]);
      await Promise.all([
        RecacheDataWallet({
          key,
          key_user_id: user_id + key,
          key_promotion_id: promotion_id + key,
        }),
        RecacheDataPromotion({
          key: "promotions",
          key_id: promotion_id + "promotions",
        }),
      ]);

      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: wallet,
      });
    } catch (err) {
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
      if (data.is_use && typeof data.is_use !== "boolean")
        data.is_use = data.is_use === "true";

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

      await Promise.all([
        RecacheDataWallet({
          key,
          key_user_id: walletExists.user_id + key,
          key_promotion_id: walletExists.promotion_id + key,
        }),
        RecacheDataWallet({
          key,
          key_user_id: updatedWallet.user_id + key,
          key_promotion_id: updatedWallet.promotion_id + key,
        }),
      ]);

      // Send success response with the updated wallet data
      return SendSuccess({
        res,
        message: EMessage.updateSuccess,
        data: updatedWallet,
      });
    } catch (err) {
      // Log the err and send an appropriate response
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
      await RecacheDataWallet({
        key,
        key_user_id: walletExists.user_id + key,
        key_promotion_id: walletExists.promotion_id + key,
      });

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
