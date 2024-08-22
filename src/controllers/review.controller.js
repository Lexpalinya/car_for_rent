import { CachDataAll } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import prisma from "../utils/prisma.client";

const ReviewController = {
  async Insert(req, res) {
    try {
      const validate = ValidateReveiw(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      let { user_id, post_id, star, comment } = req.body;
      if (typeof star !== "number") star = parseFloat(star);
      const [userExists, postExists] = await Promise.all([
        FindUserById_ID(user_id),
        FindPostById_ID(post_id),
      ]);
      if (!userExists || !postExists)
        return SendError(
          res,
          404,
          `${EMessage.notFound}:${!userExists ? "user" : "post"} id`
        );
      const reveiw = await prisma.review.create({
        data: { user_id, post_id, star, comment },
      });
      return SendCreate(res, `${EMessage.insertSuccess}`, reveiw);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        error
      );
    }
  },

  async Delete(req, res) {
    try {
      const id = req.params.id;
      const reveiwExists = await FindReviewById_ID(id);
      if (!reveiwExists)
        return SendError(res, 404, `${EMessage.notFound}: review id`);
      const review = await prisma.review.update({
        where: {
          id,
        },
        data: {
          is_active: false,
        },
      });
      return SendSuccess(res, `${EMessage.deleteSuccess}`, review);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed}`,
        error
      );
    }
  },
  async SelectByPostId(req, res) {
    try {
      const id = req.params.id;
      const review = await CachDataAll(
        key,
        model,
        { post_id: id, is_active },
        select
      );
      return SendSuccess(res, `${EMessage.fetchAllSuccess}`, review);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll} review by post_id`,
        error
      );
    }
  },
};
export default ReviewController;
