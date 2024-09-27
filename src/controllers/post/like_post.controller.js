import redis from "../../DB/redis";
import { CachDataLimit } from "../../services/cach.contro";
import { DeleteCachedKey } from "../../services/cach.deletekey";
import { EMessage } from "../../services/enum";
import { FindPostById_for_edit, FindUserById_ID } from "../../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../../services/services";
import { Post_like_posts } from "../../services/subtabel";
import prisma from "../../utils/prisma.client";
import { RecacheDataPost } from "./post.controller";

const key = "post";
const key_like_post = "like_post";
const model = "like_post";
const RecacheData = async ({ key_user, key_post }) => {
  await Promise.all([DeleteCachedKey(key_user), DeleteCachedKey(key_post)]);
};
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
        post_status_key: postExists.status_id + key,
      });
      await redis.del(postExists.id + key);
      RecacheData({
        key_user: like.user_id + key_like_post,
        key_post: like.post_id + key_like_post,
      });
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
        post_status_key: postExists.status_id + key,
      });
      await redis.del(postExists.id + key);
      RecacheData({
        key_user: like.user_id + key_like_post,
        key_post: like.post_id + key_like_post,
      });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess} :unlike post successfully`,
        data: like,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} post`,
        err,
      });
    }
  },

  async SelectByUser(req, res) {
    try {
      const user_id = req.user;
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const select = {
        post_id: true,
        user_id: true,
        created_at: true,
        posts: {
          select: {
            id: true,
            is_active: true,
            car_type_id: true,
            user_id: true,
            star: true,
            car_insurance: true,
            insurance_company_id: true,
            level_insurance_id: true,
            car_brand: true,
            car_version: true,
            car_year: true,
            car_resgistration: true,
            door: true,
            type_of_fual_id: true,
            driver_system: true,
            seat: true,
            car_color: true,
            description: true,
            street: true,
            point: true,
            village: true,
            district: true,
            province: true,
            mutjum: true,
            pubmai: true,
            status_id: true,
            isShowPost: true,
            created_at: true,
            updated_at: true,
            insurance_company: true,
            level_insurance: true,
            type_of_fual: true,
            currency: true,
            status: true,

            users: {
              select: {
                username: true,
                phone_number: true,
                profile: true,
                kycs: {
                  where: {
                    is_active: true,
                  },
                },
              },
            },
            car_types: true,
            // post_doc_image: true,
            // post_car_image: true,
            // post_driver_license_image: true,
            // post_insurance_image: true,
            post_rent_data: true,
            _count: {
              select: {
                like_post: true,
              },
            },
          },
        },
      };
      const [like] = await Promise.all([
        CachDataLimit(
          user_id + key_like_post + page,
          model,
          {
            user_id: user_id,
            posts: {
              is_active: true,
            },
          },
          page,
          select
        ),
        CachDataLimit(
          user_id + key_like_post + (page + 1),
          model,
          {
            user_id: user_id,
            posts: {
              is_active: true,
            },
          },
          page + 1,
          select
        ),
      ]);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess} user_id`,
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
  async SelectByPost(req, res) {
    try {
      const post_id = req.params.id;
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const select = {
        post_id: true,
        user_id: true,
        created_at: true,
        users: {
          select: {
            username: true,
            phone_number: true,
            profile: true,
            kycs: {
              where: {
                is_active: true,
              },
            },
          },
        },
      };
      const [like] = await Promise.all([
        CachDataLimit(
          post_id + key_like_post + page,
          model,
          { post_id, users: { is_active: true } },
          page,
          select
        ),
        CachDataLimit(
          post_id + key_like_post + (page + 1),
          model,
          { post_id, users: { is_active: true } },
          page + 1,
          select
        ),
      ]);

      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess} user_id`,
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
