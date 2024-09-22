import { CachDataAll, CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindPost_StatusById } from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { DataExists, ValidatePost_Status } from "../services/validate";
import prisma from "../utils/prisma.client";

let key = "post_status";
let model = "post_status";
let select;
let where = { is_active: true };
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const Post_StatusController = {
  async Insert(req, res) {
    try {
      const validate = ValidatePost_Status(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      let { nameLao, nameEng, nameChi, nameRok, priority } = req.body;
      if (typeof priority !== "number") priority = parseInt(priority, 10);
      const post_status = await prisma.post_status.create({
        data: {
          nameLao,
          nameEng,
          nameChi,
          nameRok,
          priority,
        },
      });
      await RecacheData();
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: post_status,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} post_status`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      if (data.priority && data.priority !== "number")
        data.priority = parseInt(data.priority, 10);
      const statusExists = await FindPost_StatusById(id);
      if (!statusExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}:post_status`,
          err: "id",
        });
      const status = await prisma.post_status.update({
        where: { id },
        data,
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: status,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed}`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const statusExists = await FindPost_StatusById(id);
      if (!statusExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}:post_status`,
          err: "id",
        });
      const status = await prisma.post_status.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: status,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} post_status`,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      const status = await CachDataNoClear(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: status,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} post_status `,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const status = await FindPost_StatusById(id);
      if (!status)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}:post_status`,
          err: "id",
        });
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess}`,
        data: status,
      });
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne} post_status`,
        err
      );
    }
  },
  async SelectForshowCarData(req, res) {
    try {
      const status = await CachDataNoClear(
        key + "show_cardata",
        model,
        {
          ...where,
          priority: {
            gte: 1,
            lte: 2,
          },
        },
        select,
        {
          priority: "asc",
        }
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: status,
      });
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne} post_status select for show car data`,
        err
      );
    }
  },
  async SelectForshowFollow(req, res) {
    try {
      const status = await CachDataNoClear(
        key + "show_follow",
        model,
        {
          ...where,
          priority: {
            gte: 3,
            lte: 5,
          },
        },
        select,
        {
          priority: "asc",
        }
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: status,
      });
    } catch (err) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne} post_status select for show car data`,
        err
      );
    }
  },
};
export default Post_StatusController;
