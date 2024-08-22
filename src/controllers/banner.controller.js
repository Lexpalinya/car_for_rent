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
        return SendError(res, 400, `${EMessage.pleaseInput}:image`);
      }
      const url = await UploadImage(data.image.data);
      console.log("url :>> ", url);
      if (!url) {
        throw new Error("upload image failed");
      }
      const banner = await prisma.banners.create({
        data: {
          image: url,
        },
      });
      await RecacheData();
      return SendCreate(res, `${EMessage.insertSuccess}`, banner);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} bannner insert`,
        error
      );
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const { old_image } = req.body;
      if (!old_image)
        return SendError(res, 400, `${EMessage.pleaseInput} :old_image`);
      const data = req.files;
      if (!data || !data.image) {
        return SendError(res, 400, `${EMessage.pleaseInput}:image`);
      }
      const bannerExists = await FindBannerById(id);
      if (!bannerExists) {
        return SendError(res, `${EMessage.notFound}: banner id`);
      }
      const url = await UploadImage(data.image.data);
      console.log("url :>> ", url);
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
      return SendSuccess(res, `${EMessage.updateSuccess}`, banner);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} bannner update`,
        error
      );
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const bannerExists = await FindBannerById(id);
      if (!bannerExists) {
        return SendError(res, `${EMessage.notFound}: banner id`);
      }
      const banner = await prisma.banners.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheData();
      await CachDataAll(key, model, where, select);
      return SendSuccess(res, `${EMessage.updateSuccess}`, banner);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed} bannner delete`,
        error
      );
    }
  },
  async SelectAll(req, res) {
    try {
      const banner = await CachDataAll(key, model, where, select);
      SendSuccess(res, `${EMessage.fetchAllSuccess}`, banner);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll} bannner select all`,
        error
      );
    }
  },
  async SelectIsPublic(req, res) {
    try {
      const bannerData = await CachDataAll(key, model, where, select);
      let banner = bannerData.filter((item) => item.is_public === true);
      SendSuccess(res, `${EMessage.fetchAllSuccess}`, banner);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll} bannner is public`,
        error
      );
    }
  },
};
export default BannerController;
