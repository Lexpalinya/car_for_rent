import { EMessage } from "../services/enum";
import {
  AddPopular_places_images_id_url,
  EnsureArray,
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { DataExists, ValidatePopular_Places } from "../services/validate";
import {
  DeleteImage,
  UploadImage,
  uploadImages,
} from "../services/upload.file";
import prisma from "../utils/prisma.client";
import { Popular_places_images } from "../services/subtabel";
import { CachDataLimit } from "../services/cach.contro";
import { FindPopular_placesById } from "../services/find";
import { DeleteCachedKey } from "../services/cach.deletekey";
import redis from "../DB/redis";
let key = "popular_places";
let model = "popular_places";
let where = {
  is_active: true,
};
let select = {
  id: true,
  is_active: true,
  name: true,
  point: true,
  street: true,
  //   village: true,
  province: true,
  district: true,
  coverImage: true,
  details: true,
  created_at: true,
  updated_at: true,
  popular_places_images: true,
};
const RecacheData = async ({ key, keyId }) => {
  const promiseList = [];
  if (key) promiseList.push(DeleteCachedKey(key));
  if (keyId) promiseList.push(redis.del(keyId));
  await Promise.all(promiseList);
};
const Popular_PlacesController = {
  async Insert(req, res) {
    try {
      const data = req.files;
      let coverImage = data.coverImage;
      let images = data.images;
      if (!data || !coverImage || !images) {
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: `${
            !data
              ? "coverImage and images"
              : !data.coverImage
              ? "coverImage"
              : "images"
          }`,
        });
      }
      const validate = ValidatePopular_Places(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { name, street, point, district, province, details } = req.body;

      images = EnsureArray(images);
      const [coverImage_url, images_url] = await Promise.all([
        UploadImage(coverImage.data),

        uploadImages(images),
      ]);
      const places = await prisma.popular_places.create({
        data: {
          name,
          street,
          point,
          //   village,
          district,
          province,
          details,
          coverImage: coverImage_url,
        },
      });
      const add_image = AddPopular_places_images_id_url(images_url, places.id);
      await Popular_places_images.insert(add_image);
      await RecacheData({ key });
      return SendCreate({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: places,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} popular_places`,
        err,
      });
    }
  },

  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      const placesExists = await FindPopular_placesById(id);
      if (!placesExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: popular_places`,
          err: "id",
        });
      const popular_places = await prisma.popular_places.update({
        where: { id },
        data,
      });
      await RecacheData({ key, keyId: popular_places.id });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: popular_places,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} popular_places`,
        err,
      });
    }
  },

  async UpdateCoverImage(req, res) {
    try {
      const id = req.params.id;
      const { old_coverImage } = req.body;
      if (!old_coverImage)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "old_coverImage",
        });
      const data = req.files;
      if (!data || !data.coverImage)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "coverImage",
        });
      const placesExists = await FindPopular_placesById(id);
      if (!placesExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: popular_places`,
          err: "id",
        });
      const url = await UploadImage(data.coverImage.data);

      if (!url) {
        throw new Error("upload coverImage failed");
      }
      const popular_places = await prisma.popular_places.update({
        where: { id },
        data: {
          coverImage: url,
        },
      });
      await RecacheData({ key, keyId: popular_places.id });
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: popular_places,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} popular_places CoverImage`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const placesExists = await FindPopular_placesById(id);
      if (!placesExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: popular_places`,
          err: "id",
        });
      const popular_places = await prisma.popular_places.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheData({ key, keyId: popular_places.id + key });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: popular_places,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} popular_places`,
        err,
      });
    }
  },

  async UpdateImages_Add_image(req, res) {
    try {
      const id = req.params.id;
      const data = req.files;
      if (!data || !data.images)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "images",
        });
      const placesExists = await FindPopular_placesById(id);
      if (!placesExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: popular_places`,
          err: "id",
        });
      const image_url = await UploadImage(data.images.data);
      const popular_places_images = await Popular_places_images.insertOne({
        place_id: placesExists.id,
        url: image_url,
      });
      await RecacheData({ key, keyId: popular_places_images.id + key });
      return SendSuccess({
        res,
        message: `${EMessage.insertSuccess} popular_places_images`,
        data: popular_places_images,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} popular_places images add image`,
        err,
      });
    }
  },
  async UpdateImages_Update_image(req, res) {
    try {
      const id = req.params.id;
      const data = req.files;
      let { images_data_update } = req.body;

      if (!images_data_update) {
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "images_data_update",
        });
      }
      if (typeof images_data_update === "string") {
        images_data_update = JSON.parse(images_data_update);
      }

      if (!images_data_update.id || !images_data_update.url) {
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: `popular_images type object {id,post_id,url}`,
        });
      }
      if (!data || !data.images)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "images",
        });

      const [placesExists, imagesExists] = await Promise.all([
        FindPopular_placesById(id),
        Popular_places_images.findUnique({ id: images_data_update.id }),
      ]);
      if (!placesExists || !imagesExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}:`,
          err: `${!placesExists ? "popular_places" : "popular_images"} id`,
        });

      const image_url = await UploadImage(
        data.images.data,
        images_data_update.url
      );
      const popular_places_images = await Popular_places_images.update(
        images_data_update.id,
        {
          url: image_url,
        }
      );
      await RecacheData({ key, keyId: popular_places_images.id + key });
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess} popular_places_images`,
        data: popular_places_images,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} popular_places images add image`,
        err,
      });
    }
  },
  async UpdateImages_Delete_image(req, res) {
    try {
      const id = req.params.id;

      let { images_data_update } = req.body;

      if (!images_data_update) {
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "images_data_update",
        });
      }
      if (typeof images_data_update === "string") {
        images_data_update = JSON.parse(images_data_update);
      }

      if (!images_data_update.id || !images_data_update.url) {
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: `popular_images type object {id,post_id,url}`,
        });
      }
      const [placesExists, imagesExists] = await Promise.all([
        FindPopular_placesById(id),
        Popular_places_images.findUnique({ id: images_data_update.id }),
      ]);
      if (!placesExists || !imagesExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}:`,
          err: `${!placesExists ? "popular_places" : "popular_images"} id`,
        });

      const popular_places_images = await Promise.all([
        Popular_places_images.deleteWhere({
          id: images_data_update.id,
        }),
        DeleteImage(images_data_update.url),
      ]);
      await RecacheData({ key, keyId: popular_places_images.id + key });
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess} popular_places_images`,
        data: popular_places_images,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} popular_places images add image`,
        err,
      });
    }
  },
  async SelectAllPages(req, res) {
    try {
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const [post] = await Promise.all([
        CachDataLimit(key + "-" + page, model, where, page, select),
        CachDataLimit(key + "-" + (page + 1), model, where, page + 1, select),
      ]);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess} post`,
        data: post,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} bannner`,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const popular_places = await FindPopular_placesById(id);
      if (!popular_places)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: popular_places`,
          err: "id",
        });

      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: popular_places,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} popular_places`,
        err,
      });
    }
  },
};
export default Popular_PlacesController;
