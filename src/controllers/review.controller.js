import redis from "../DB/redis";
import { CachDataAll } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import {
  FindPostById_for_edit,
  FindReviewById_ID,
  FindUserById_ID,
} from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { ValidateReveiw } from "../services/validate";
import prisma from "../utils/prisma.client";
let key = "reviews";
let model = "review";
let where = { is_active: true };
let select = {
  id: true,
  is_active: true,
  user_id: true,
  star: true,
  comment: true,
  created_at: true,
  updated_at: true,
  user: {
    select: {
      username: true,
      profile: true,
    },
  },
};
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
        FindPostById_for_edit(post_id),
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
      await redis.del(post_id + key);
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
      await redis.del(reveiwExists.post_id + key, id + "reviews");
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
        id + key,
        model,
        { post_id: id, is_active: true },
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
