import { CachDataAll } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import { FindLablesById } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import prisma from "../utils/prisma.client";

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
        FindPostById_ID(post_id),
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
      return SendSuccess(res, `${EMessage.insertSuccess}`, label_data);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed}`,
        error
      );
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const label_data = await prisma.labels_data.delete({
        where: { id },
      });
      return SendSuccess(res, `${EMessage.deleteSuccess}`, label_data);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed}`,
        error
      );
    }
  },
  async SelectByPostID(req, res) {
    try {
      const id = parseInt(`${req.params.id}`, 10);

      const label_data = await CachDataAll(
        key,
        model,
        { post_id: id, is_active: true },
        select
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
