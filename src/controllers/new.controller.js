import { CachDataAll, CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindNewsById } from "../services/find";
import { S3UploadImage } from "../services/s3UploadImage";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import prisma from "../utils/prisma.client";
let key = "news";
let model = "news";
let where = { is_active: true };
let select;
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const NewsController = {
  async Insert(req, res) {
    try {
      const data = req.files;
      if (!data || !data.image) {
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "image",
        });
      }
      const url = await S3UploadImage(data.image);
      if (!url) {
        throw new Error("upload image failed");
      }
      const news = await prisma.news.create({
        data: {
          image: url,
        },
      });
      await RecacheData();
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: news,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} news`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const { old_image } = req.body;
      if (!old_image)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "old_image",
        });
      const data = req.files;
      if (!data || !data.image)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "image",
        });
      const newsExists = await FindNewsById(id);
      if (!newsExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: news`,
          err: "id",
        });

      const url = await S3UploadImage(data.image, old_image);

      if (!url) {
        throw new Error("upload image failed");
      }
      const news = await prisma.news.update({
        where: { id },
        data: {
          image: url,
        },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: news,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} news`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const newsExists = await FindNewsById(id);
      if (!newsExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: news`,
          err: "id",
        });
      const news = await prisma.news.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheData();
      await CachDataAll(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: news,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} news`,
        err,
      });
    }
  },
  async Update_Is_public(req, res) {
    try {
      const id = req.params.id;
      let { is_public } = req.body;

      if (!is_public)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.pleaseInput}`,
          err: "is_public",
        });
      if (typeof is_public !== "boolean") is_public = is_public === "true";
      const newsExists = await FindNewsById(id);
      if (!newsExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: news`,
          err: "id",
        });
      const news = await prisma.news.update({
        where: { id },
        data: { is_public },
      });
      await RecacheData();
      await CachDataAll(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: news,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} news`,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      const news = await CachDataAll(key, model, where, select);
      SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: news,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} news`,
        err,
      });
    }
  },
  async SelectIsPublic(req, res) {
    try {
      const bannerData = await CachDataAll(key, model, where, select);
      let news = bannerData.filter((item) => item.is_public === true);
      SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess} is Public`,
        data: news,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} news is public`,
        err,
      });
    }
  },
};
export default NewsController;
