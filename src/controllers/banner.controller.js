import redis from "../DB/redis";
import { CachDataAll, CachDataNoClear } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindBannerById } from "../services/find";
import {
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { UploadImage } from "../services/upload.file";
import prisma from "../utils/prisma.client";
let key = "banners";
let model = "banners";
let where = { is_active: true };
let select;
const RecacheData = async () => {
  await DeleteCachedKey(key);
  await CachDataNoClear(key, model, where, select);
};
const BannerController = {
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
      const url = await UploadImage(data.image.data);
      if (!url) {
        throw new Error("upload image failed");
      }
      const banner = await prisma.banners.create({
        data: {
          image: url,
        },
      });
      await RecacheData();
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: banner,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} bannner`,
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
      const bannerExists = await FindBannerById(id);
      if (!bannerExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: banner`,
          err: "id",
        });

      const url = await UploadImage(data.image.data);

      if (!url) {
        throw new Error("upload image failed");
      }
      const banner = await prisma.banners.update({
        where: { id },
        data: {
          image: url,
        },
      });
      await RecacheData();
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: banner,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} banner`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const bannerExists = await FindBannerById(id);
      if (!bannerExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: banner`,
          err: "id",
        });
      const banner = await prisma.banners.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheData();
      await CachDataAll(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: banner,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} bannner`,
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
      const bannerExists = await FindBannerById(id);
      if (!bannerExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: banner`,
          err: "id",
        });
      const banner = await prisma.banners.update({
        where: { id },
        data: { is_public },
      });
      await RecacheData();
      await CachDataAll(key, model, where, select);
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: banner,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} bannner`,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      const banner = await CachDataAll(key, model, where, select);
      SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: banner,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} bannner`,
        err,
      });
    }
  },
  async SelectIsPublic(req, res) {
    try {
      const bannerData = await CachDataAll(key, model, where, select);
      let banner = bannerData.filter((item) => item.is_public === true);
      SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess} is Public`,
        data: banner,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} bannner is public`,
        err,
      });
    }
  },
};
export default BannerController;
