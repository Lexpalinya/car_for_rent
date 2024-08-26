import redis from "../DB/redis";
import { CachDataAll } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import { FindLablesById, FindPostById_for_edit } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import { ValidateLabels_data } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "posts";
let model = "labels_data";
let select;
const Labels_DataController = {
  async Insert(req, res) {
    try {
      const validate = ValidateLabels_data(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const { post_id, label_id } = req.body;
      const [postExists, labelExists] = await Promise.all([
        FindPostById_for_edit(post_id),
        FindLablesById(label_id),
      ]);
      if (!postExists || !labelExists)
        return SendError(
          res,
          404,
          `${EMessage.notFound}:${!postExists ? "post" : "lable"} Id`
        );
      const label_data = await prisma.labels_data.create({
        data: {
          post_id,
          label_id,
        },
      });
      await redis.del(postExists.id + key, postExists.id + key);
      return SendSuccess(res, `${EMessage.insertSuccess}`, label_data);
    } catch (error) {
      if (error.code === "P2002") {
        return SendError(res, 400, `this post have label tag`);
      }
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed}`,
        error
      );
    }
  },
  async Delete(req, res) {
    try {
      let id = parseInt(`${req.params.id}`, 10);

      const label_data = await prisma.labels_data.delete({
        where: { id },
      });
      return SendSuccess(res, `${EMessage.deleteSuccess}`, label_data);
    } catch (error) {
      if (error.code === "P2025") {
        return SendError(res, 400, `Record to delete does not exist`);
      }
      await redis.del(postExists.id + key, postExists.id + key);
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed}`,
        error
      );
    }
  },
  async SelectByPostID(req, res) {
    try {
      const id = req.params.id;

      const label_data = await CachDataAll(
        id + key,
        model,
        { post_id: id },
        {
          id: true,
          label_id: true,
          post_id: true,
          label: {
            select: {
              name: true,
              icon: true,
            },
          },
        },
        {}
      );
      return SendSuccess(res, `${EMessage.fetchAllSuccess}`, label_data);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.fetchAllSuccess} labels_data by post_id`,
        error
      );
    }
  },
};
export default Labels_DataController;
