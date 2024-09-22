import { CachDataLimit } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { DataExists } from "../services/validate";
import prisma from "../utils/prisma.client";

const ReelsController = {
  async Insert(req, res) {
    try {
      const validate = ValidateReels(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const { user_id, title, detail } = req.body;
      const data = req.files;
      if (!data || !data.video)
        return SendError(res, 400, `${EMessage.pleaseInput}:  video`);
      const userExists = await FindUserById_ID(user_id);
      if (!userExists)
        return SendError(res, 404, `${EMessage.notFound}:user id`);
      const url = await UploadVideo(data.video.data);
      if (!url) throw new Error("upload video failed");
      const reels = await prisma.reels.create({
        data: { user_id, title, detail, url },
      });
      return SendCreate(res, `${EMessage.insertSuccess}`, reels);
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} reels`,
        err
      );
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const reelsExists = await FindReelsById_ID(id);
      if (!reelsExists) return SendError(res, `${EMessage.notFound}: reels id`);
      const reels = await prisma.reels.update({ where: { id }, data });
      return SendSuccess(res, `${EMessage.updateSuccess} `, reels);
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} reels`,
        err
      );
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const reelsExists = await FindReelsById_ID(id);
      if (!reelsExists) return SendError(res, `${EMessage.notFound}: reels id`);
      const reels = await prisma.reels.update({
        where: { id },
        data: { is_active: false },
      });
      return SendSuccess(res, `${EMessage.updateSuccess} `, reels);
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} reels`,
        err
      );
    }
  },
  async SelectAllPage(req, res) {
    try {
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const reels = await CachDataLimit(
        key + "-" + page,
        model,
        where,
        page,
        select
      );
      CachDataLimit(key + "-" + (page + 1), model, where, page + 1, select);
      return SendSuccess(res, `${EMessage.fetchOneSuccess} reels`, reels);
    } catch (err) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        err
      );
    }
  },

  async LikeReels(req, res) {
    try {
      const { reels_id, user_id } = req.body;

      const [reelsExists, userExists] = await Promise.all([
        FindReelsById_ID(reels_id),
        FindUserById_ID(user_id),
      ]);
      if (!reelsExists || !userExists)
        return SendSuccess(
          res,
          `${EMessage.notFound}: ${!reelsExists ? "reels" : "user"} id`
        );
      const like_reels = await prisma.like_reel.create({
        data: {
          reels_id,
          user_id,
        },
      });
      return SendCreate(res, `${EMessage.likeSuccess}`, like_reels);
    } catch (err) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed}`,
        err
      );
    }
  },
  async UnLikeReels(req, res) {
    try {
      const { reels_id, user_id } = req.body;
      const Unlike_reels = await prisma.like_reel.delete({
        where: { reels_id, user_id },
      });
      if (!Unlike_reels) return SendError(res, 404, `${EMessage.notFound}`);
      return SendCreate(res, `${EMessage.likeSuccess}`, Unlike_reels);
    } catch (err) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed}`,
        err
      );
    }
  },
};
export default ReelsController;
