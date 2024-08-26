import { EMessage } from "../services/enum";
import { FindPostById_for_edit } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import { Post_rent_data } from "../services/subtabel";
import { ValidatePost_rent_data } from "../services/validate";

const Post_rent_dataController = {
  async InsertPost_rent_data(req, res) {
    try {
      const post_id = req.params.id;
      const validate = ValidatePost_rent_data(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      let { title, price, deposit, system_cost, total } = req.body;
      if (typeof price !== "number") {
        price = parseFloat(price);
      }
      if (typeof deposit !== "number") {
        deposit = parseFloat(deposit);
      }
      if (typeof system_cost !== "number") {
        system_cost = parseFloat(system_cost);
      }
      if (typeof total !== "number") {
        total = parseFloat(total);
      }

      const postExists = await FindPostById_for_edit(post_id);
      if (!postExists) {
        return SendError(res, `${EMessage.notFound}: post id`);
      }
      const post_rent_data = await Post_rent_data.insertOne({
        post_id,
        title,
        price,
        deposit,
        system_cost,
        total,
      });
      return SendSuccess(
        res,
        `${EMessage.insertSuccess} post_rent_data`,
        post_rent_data
      );
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} post`,
        error
      );
    }
  },

  async UpdatePost_rent_data(req, res) {
    try {
      const post_id = req.params.id;
      let { id, title, price, deposit, system_cost, total } = req.body;
      const validate = ValidatePost_rent_data(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      if (typeof price !== "number") {
        price = parseFloat(price);
      }
      if (typeof deposit !== "number") {
        deposit = parseFloat(deposit);
      }
      if (typeof system_cost !== "number") {
        system_cost = parseFloat(system_cost);
      }
      if (typeof total !== "number") {
        system_cost = parseFloat(system_cost);
      }

      const postExists = await FindPostById_for_edit(post_id);
      if (!postExists) {
        return SendError(res, `${EMessage.notFound}: post id`);
      }
      const post_rent_dataExists = await Post_rent_data.findUnique({ id });
      if (!post_rent_dataExists) {
        return SendError(res, `${EMessage.notFound}: post_rent_data id`);
      }
      const post_rent_data = await Post_rent_data.update(id, {
        title,
        price,
        deposit,
        system_cost,
        total,
      });
      return SendSuccess(
        res,
        `${EMessage.updateSuccess}  post_insurance_image`,
        post_rent_data
      );
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} post`,
        error
      );
    }
  },

  async DeletePost_rent_data(req, res) {
    try {
      const post_id = req.params.id;
      const id = req.params.id;
      const [post_rent_dataExists, postExists] = await Promise.all([
        Post_rent_data.findUnique({ id }),
        FindPostById_for_edit(post_id),
      ]);
      if (!post_rent_dataExists || !postExists) {
        return SendError(
          res,
          `${EMessage.notFound}: ${
            post_rent_dataExists ? "post_rent_data id" : "post id"
          }`
        );
      }

      const post_rent_data = await Post_rent_data.delete(id);
      return SendSuccess(
        res,
        `${EMessage.deleteSuccess} post_rent_data`,
        post_rent_data
      );
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed} post`,
        error
      );
    }
  },
};

export default Post_rent_dataController;
