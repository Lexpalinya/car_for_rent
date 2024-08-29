import redis from "../DB/redis";
import { EMessage } from "../services/enum";
import { FindPostById_for_edit, FindUserById_ID } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import { Post_like_posts } from "../services/subtabel";
import prisma from "../utils/prisma.client";
import { RecacheDataPost } from "./post.controller";

let key = "post";

const Like_postController = {
  async Like_post(req, res) {
    try {
      const id = req.params.id;
      const user_id = req.user;

      const [postExists, userExists, likeExists] = await Promise.all([
        FindPostById_for_edit(id),
        FindUserById_ID(user_id),
        Post_like_posts.findFirst({
          post_id: id,
          user_id,
        }),
      ]);
      if (!postExists || !userExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: `${!postExists ? "post_id" : "user_id"}`,
        });

      if (likeExists)
        return SendError({
          res,
          statuscode: 400,
          message: "User has already liked the post",
          err: "user liked",
        });

      const like = await Post_like_posts.insertOne({ post_id: id, user_id });
      await RecacheDataPost({
        key,
        car_type_id_key: postExists.car_type_id + key,
        type_of_fual_id_key: postExists.type_of_fual_id + key,
        user_id_key: postExists.user_id + key,
      });
      await redis.del(postExists.id + key);
      return SendSuccess({
        res,
        message: `${EMessage.insertSuccess}: like post successfully`,
        data: like,
      });
    } catch (err) {
      if (err.code === "P2002")
        return SendError({
          res,
          statuscode: 400,
          message: "User has already liked the post",
          err: "user liked",
        });
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} post`,
        err,
      });
    }
  },
  async UnLike_post(req, res) {
    try {
      const id = req.params.id;
      const user_id = req.user;
      const [postExists, likeExists] = await Promise.all([
        FindPostById_for_edit(id),
        Post_like_posts.findFirst({
          post_id: id,
          user_id,
        }),
      ]);
      if (!postExists) {
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: "post_id",
        });
      }

      if (!likeExists) {
        return SendError({
          res,
          statuscode: 400,
          message: "user cannot like this post",
          err: "user cannot like this post",
        });
      }
      const like = await prisma.like_post.delete({
        where: {
          user_id_post_id: {
            user_id,
            post_id: id,
          },
        },
      });
      await RecacheDataPost({
        key,
        car_type_id_key: postExists.car_type_id + key,
        type_of_fual_id_key: postExists.type_of_fual_id + key,
        user_id_key: postExists.user_id + key,
      });
      await redis.del(postExists.id + key);
      return SendSuccess({
        res,
        message: `${EMessage.insertSuccess} :unlike post successfully`,
        data: like,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} post`,
        err,
      });
    }
  },
};
export default Like_postController;
