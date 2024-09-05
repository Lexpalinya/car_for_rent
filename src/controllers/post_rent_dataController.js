import { EMessage } from "../services/enum";
import { FindPostById_for_edit } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import { Post_rent_data } from "../services/subtabel";
import {
  ValidatePost_rent_data,
  ValidatePost_rent_dataUpdate,
} from "../services/validate";
import { RecacheDataPost } from "./post.controller";

let key = "posts";

const Post_rent_dataController = {
  async InsertPost_rent_data(req, res) {
    try {
      const post_id = req.params.id;
      const validate = ValidatePost_rent_data(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
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
      if (!postExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: post id`,
          err: "post_id",
        });

      const post_rent_data = await Post_rent_data.insertOne({
        post_id,
        title,
        price,
        deposit,
        system_cost,
        total,
      });
      await RecacheDataPost({
        key,
        car_type_id_key: postExists.car_type_id + key,
        type_of_fual_id_key: postExists.type_of_fual_id + key,
        user_id_key: postExists.user_id + key,
        post_status_key: postExists.status_id + key,
      });

      return SendSuccess({
        res,
        message: `${EMessage.insertSuccess} post_rent_data`,
        data: post_rent_data,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} post_rent_data`,
        err,
      });
    }
  },

  async UpdatePost_rent_data(req, res) {
    try {
      const post_id = req.params.id;
      let { id, title, price, deposit, system_cost, total } = req.body;
      const validate = ValidatePost_rent_dataUpdate(req.body);
      if (typeof id !== "number") {
        id = parseInt(id);
      }

      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
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

      const [postExists, post_rent_dataExists] = await Promise.all([
        FindPostById_for_edit(post_id),
        Post_rent_data.findUnique({ id }),
      ]);
      if (!postExists || !post_rent_dataExists) {
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: `${!postExists ? "post id" : "post_rent_data id"}`,
        });
      }
      if (post_id !== post_rent_dataExists.post_id)
        return SendError({
          res,
          statuscode: 400,
          message: `you not own post_rent_dat`,
        });

      const post_rent_data = await Post_rent_data.update(id, {
        title,
        price,
        deposit,
        system_cost,
        total,
      });
      await RecacheDataPost({
        key,
        car_type_id_key: postExists.car_type_id + key,
        type_of_fual_id_key: postExists.type_of_fual_id + key,
        user_id_key: postExists.user_id + key,
        post_status_key: postExists.status_id + key,
      });
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}  post_insurance_image`,
        data: post_rent_data,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} post_rent_data`,
        err,
      });
    }
  },

  async DeletePost_rent_data(req, res) {
    try {
      const post_id = req.params.id;
      let id = req.body.post_rent_data_id;
      if (!id)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.pleaseInput}: post id`,
          err: "post_rent_data_id",
        });
      if (typeof id !== "number") {
        id = parseInt(id);
      }

      const [post_rent_dataExists, postExists] = await Promise.all([
        Post_rent_data.findUnique({ id }),
        FindPostById_for_edit(post_id),
      ]);
      if (!post_rent_dataExists || !postExists) {
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: ` ${!post_rent_dataExists ? "post_rent_data id" : "post id"}`,
        });
      }

      if (post_id !== post_rent_dataExists.post_id)
        return SendError({
          res,
          statuscode: 400,
          message: `you not own post_rent_dat`,
        });
      const post_rent_data = await Post_rent_data.delete(id);
      await RecacheDataPost({
        key,
        car_type_id_key: postExists.car_type_id + key,
        type_of_fual_id_key: postExists.type_of_fual_id + key,
        user_id_key: postExists.user_id + key,
        post_status_key: postExists.status_id + key,
      });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess} post_rent_data`,
        err: post_rent_data,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} post`,
        err,
      });
    }
  },
};

export default Post_rent_dataController;
