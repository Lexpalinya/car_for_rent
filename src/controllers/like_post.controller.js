import redis from "../DB/redis";
import { EMessage } from "../services/enum";
import { FindPostById_for_edit, FindUserById_ID } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import { Post_like_posts } from "../services/subtabel";
import prisma from "../utils/prisma.client";

let key = "post";

const Like_postController = {
  async Like_post(req, res) {
    try {
      const id = req.params.id;
      const { user_id } = req.body;

      if (!user_id) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: user_id is required`
        );
      }

      const [postExists, userExists, likeExists] = await Promise.all([
        FindPostById_for_edit(id),
        FindUserById_ID(user_id),
        Post_like_posts.findFirst({
          post_id: id,
          user_id,
        }),
      ]);
      if (!postExists) {
        return SendError(res, 404, `${EMessage.notFound}: post id`);
      }

      if (!userExists) {
        return SendError(res, 404, `${EMessage.notFound}: user id`);
      }

      if (likeExists) {
        return SendError(res, 400, "User has already liked the post");
      }

      const like = await Post_like_posts.insertOne({ post_id: id, user_id });
      await redis.del(postExists.id + key);
      return SendSuccess(
        res,
        `${EMessage.insertSuccess}: like post successfully`,
        like
      );
    } catch (error) {
      if (error.code === "P2002") {
        return SendError(res, 400, "User has already liked the post");
      }
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} post`,
        error
      );
    }
  },
  async UnLike_post(req, res) {
    try {
      const id = req.params.id;
      const { user_id } = req.body;

      if (!user_id) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: user_id is required`
        );
      }
      const [postExists, likeExists] = await Promise.all([
        FindPostById_for_edit(id),
        Post_like_posts.findFirst({
          post_id: id,
          user_id,
        }),
      ]);
      if (!postExists) {
        return SendError(res, 404, `${EMessage.notFound}: post id`);
      }

      if (!likeExists) {
        return SendError(res, 400, "user cannot like this post");
      }
      const like = await prisma.like_post.delete({
        where: {
          user_id_post_id: {
            user_id,
            post_id: id,
          },
        },
      });
      await redis.del(postExists.id + key);
      return SendSuccess(
        res,
        `${EMessage.insertSuccess} :unlike post successfully`,
        like
      );
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} post`,
        error
      );
    }
  },
};
export default Like_postController;
