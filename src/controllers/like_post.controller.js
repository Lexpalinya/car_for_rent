import { FindPostById_for_edit, FindUserById_ID } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";

const Like_postController = {
  async Like_post(req, res) {
    try {
      const id = req.params.id;
      const { user_id } = req.body;
      const postExists = await FindPostById_for_edit(id);
      if (!postExists) {
        return SendError(res, `${EMessage.notFound}: post id`);
      }
      const userExists = await FindUserById_ID(user_id);
      if (!userExists) {
        return SendError(res, `${EMessage.notFound}: user id`);
      }
      const like = Post_like_posts.insertOne({ post_id: id, user_id });

      return SendSuccess(
        res,
        `${EMessage.insertSuccess} :like post successfully`,
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
  async UnLike_post(req, res) {
    try {
      const id = req.params.id;
      const { user_id } = req.body;
      const postExists = await FindPostById_for_edit(id);
      if (!postExists) {
        return SendError(res, `${EMessage.notFound}: post id`);
      }
      const userExists = await FindUserById_ID(user_id);
      if (!userExists) {
        return SendError(res, `${EMessage.notFound}: user id`);
      }
      const like = Post_like_posts.deleteWhere({ post_id: id, user_id });

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
