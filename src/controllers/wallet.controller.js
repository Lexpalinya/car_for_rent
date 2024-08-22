import { CachDataAll, CachDataLimit } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import { FindPromotionById_ID } from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { DataExists } from "../services/validate";
import prisma from "../utils/prisma.client";

const WalletController = {
  async Insert(req, res) {
    try {
      const validate = ValidateWallet(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const { user_id, promotion_id } = req.body;
      const [userExists, promotionExists] = await Promise.all([
        FindUserById_ID(user_id),
        FindPromotionById_ID(promotion_id),
      ]);
      if (!userExists || !promotionExists)
        return SendError(
          res,
          400,
          `${EMessage.notFound} :${!userExists ? "user id" : "promotion id"}`
        );
      const wallet = await prisma.wallet.create({
        data: {
          user_id,
          promotion_id,
        },
      });
      SendCreate(res, `${EMessage.insertSuccess}`, wallet);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} wallet`,
        error
      );
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;

      // Validate and clean up the input data
      const data = DataExists(req.body);

      // Initialize an array of promises to validate relationships
      const promises = [FindWalletById_ID(id)];
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
        return SendError(res, 404, `${EMessage.notFound}: ${missingEntity} id`);
      }

      // Proceed with updating the wallet
      const updatedWallet = await prisma.wallet.update({
        where: { id },
        data,
      });

      // Send success response with the updated wallet data
      return SendSuccess(res, EMessage.updateSuccess, updatedWallet);
    } catch (error) {
      // Log the error and send an appropriate response
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} wallet`,
        error
      );
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const walletExists = await FindWalletById_ID(id);
      if (!walletExists) {
        return SendError(res, 404, `${EMessage.notFound}:wallet id`);
      }
      const wallet = await prisma.wallet.update({
        where: { id },
        data: {
          is_active: false,
        },
      });
      return SendSuccess(res, `${EMessage.deleteSuccess}`, wallet);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed} wallet`,
        error
      );
    }
  },

  async SelectByUserID(req, res) {
    try {
      const id = req.params.id;
      const wallet = await CachDataAll(
        key,
        model,
        { is_active: true, user_id: id },
        select
      );
      return SendSuccess(res, `${EMessage.fetchAllSuccess}`, wallet);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll} wallet by user id`,
        error
      );
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
      return SendSuccess(res, `${EMessage.fetchOneSuccess} wallet`, wallet);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll} wallet by user id`,
        error
      );
    }
  },
};
export default WalletController;
