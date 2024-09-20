import redis from "../DB/redis";
import { CachDataAll } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import {
  FindPostById,
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
import { RecacheDataPost } from "./post.controller";
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
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const user_id = req.user;
      let { post_id, star, comment } = req.body;
      if (typeof star !== "number") star = parseFloat(star);
      const [userExists, postExists] = await Promise.all([
        FindUserById_ID(user_id),
        FindPostById_for_edit(post_id),
      ]);
      if (!userExists || !postExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: `${!userExists ? "user" : "post"} id`,
        });
      const reveiw = await prisma.review.create({
        data: { user_id, post_id, star, comment },
      });
      await redis.del(post_id + key);
      const stars = await prisma.review.aggregate({
        where: {
          post_id,
        },
        _avg: {
          star: true,
        },
      });
      // const convertstar = parseFloat(stars._avg.star);
      console.log("stars :>> ", stars);
      const post = await prisma.posts.update({
        where: {
          id: post_id,
        },
        data: {
          star: stars._avg.star,
        },
      });
      await Promise.all([
        RecacheDataPost({
          key: "posts",
          car_type_id_key: post.car_type_id + "posts",
          type_of_fual_id_key: post.type_of_fual_id + "posts",
          user_id_key: post.user_id + "posts",
          post_status_key: post.status_id + "posts",
        }),
        redis.del(post.id + "posts"),
      ]);
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: reveiw,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        err,
      });
    }
  },

  async Delete(req, res) {
    try {
      const id = req.params.id;
      const reveiwExists = await FindReviewById_ID(id);
      if (!reveiwExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: "review id",
        });
      const review = await prisma.review.update({
        where: {
          id,
        },
        data: {
          is_active: false,
        },
      });
      await redis.del(reveiwExists.post_id + key);
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: review,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed}`,
        err,
      });
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
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: review,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} review by post_id`,
        err,
      });
    }
  },
};
export default ReviewController;
