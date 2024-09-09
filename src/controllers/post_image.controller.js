import { EMessage } from "../services/enum";
import { FindPostById_for_edit } from "../services/find";
import { SendError, SendErrorLog, SendSuccess } from "../services/services";
import {
  Post_car_image,
  Post_doc_image,
  Post_driver_license_image,
  Post_insurance_image,
} from "../services/subtabel";
import { DeleteImage, UploadImage } from "../services/upload.file";
import { RecacheDataPost } from "./post.controller";
let key = "posts";
const InsertPostImage = async (req, res, imageType, InsertImage) => {
  try {
    const post_id = req.params.id;
    const data = req.files;
    if (!data || !data[imageType]) {
      return SendError({
        res,
        statuscode: 400,
        message: `${EMessage.pleaseInput}`,
        err: ` ${imageType}`,
      });
    }
    const [postExists] = await Promise.all([FindPostById_for_edit(post_id)]);
    if (!postExists) {
      return SendError({
        res,
        statuscode: 404,
        message: `${EMessage.notFound}`,
        err: "post_id",
      });
    }
    const imageUrl = await UploadImage(data[imageType].data);
    const post_image = await InsertImage({ post_id, url: imageUrl });
    await RecacheDataPost({
      key,
      car_type_id_key: postExists.car_type_id + key,
      type_of_fual_id_key: postExists.type_of_fual_id + key,
      user_id_key: postExists.user_id + key,
      post_status_key: postExists.status_id + key,
    });
    return SendSuccess({
      res,
      message: `${EMessage.insertSuccess} ${imageType}`,
      data: post_image,
    });
  } catch (err) {
    return SendErrorLog({
      res,
      message: `${EMessage.serverError} ${EMessage.insertFailed} ${imageType}`,
      err,
    });
  }
};
const UpdatePostImage = async (
  req,
  res,
  imageType,
  findImageById,
  updateImage
) => {
  try {
    const id = req.params.id;
    let { image_data_update } = req.body;

    if (!image_data_update) {
      return SendError({
        res,
        statuscode: 400,
        message: `${EMessage.pleaseInput}`,
        err: "image_data_update",
      });
    }

    if (typeof image_data_update === "string") {
      image_data_update = JSON.parse(image_data_update);
    }

    if (!image_data_update.id || !image_data_update.url) {
      return SendError({
        res,
        statuscode: 400,
        message: `${EMessage.pleaseInput}`,
        err: `${imageType} type object {id,post_id,url}`,
      });
    }

    const data = req.files;

    if (!data || !data[imageType]) {
      return SendError({
        res,
        statuscode: 400,
        message: `${EMessage.pleaseInput}`,
        err: `${imageType}`,
      });
    }

    const [postExists, imageExists] = await Promise.all([
      FindPostById_for_edit(id),
      findImageById({ id: image_data_update.id }),
    ]);

    if (!postExists || !imageExists) {
      return SendError({
        res,
        statuscode: 404,
        message: `${EMessage.notFound}: `,
        err: `${!postExists ? "post" : imageType} id`,
      });
    }
    if (id !== imageExists.post_id)
      return SendError({
        res,
        statuscode: 400,
        message: `you not own post_rent_data`,
        err: `you not own post_rent_data`,
      });

    const imageUrl = await UploadImage(
      data[imageType].data,
      image_data_update.url
    );

    if (!imageUrl) {
      throw new Error(`upload ${imageType} failed`);
    }

    const imageUpdate = await updateImage(image_data_update.id, {
      url: imageUrl,
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
      message: `${EMessage.updateSuccess} update ${imageType}`,
      data: imageUpdate,
    });
  } catch (err) {
    return SendErrorLog({
      res,
      message: `${EMessage.serverError} ${EMessage.updateFailed} ${imageType}`,
      err,
    });
  }
};

const DeletePostImage = async (
  req,
  res,
  imageType,
  findImageById,
  deleteImage
) => {
  try {
    const id = req.params.id;
    let { image_data_delete } = req.body;

    if (!image_data_delete) {
      return SendError({
        res,
        statuscode: 400,
        message: `${EMessage.pleaseInput}`,
        err: " image_data_delete",
      });
    }
    if (typeof image_data_delete === "string") {
      image_data_delete = JSON.parse(image_data_delete);
    }

    if (!image_data_delete.id || !image_data_delete.url) {
      return SendError({
        res,
        statuscode: 400,
        message: `${EMessage.pleaseInput}`,
        err: ` ${imageType} type object {id,post_id,url}`,
      });
    }

    const [postExists, imageExists] = await Promise.all([
      FindPostById_for_edit(id),
      findImageById({ id: image_data_delete.id }),
    ]);

    if (!postExists || !imageExists) {
      return SendError({
        res,
        statuscode: 404,
        message: `${EMessage.notFound}`,
        err: `${!postExists ? "post" : imageType} id`,
      });
    }
    if (id !== imageExists.post_id)
      return SendError({
        res,
        statuscode: 400,
        message: `you not own post_rent_dat`,
        err: `you not own post_rent_dat`,
      });
    const delImage = await DeleteImage(image_data_delete.url);
    console.log("delImage :>> ", delImage);
    const imageUpdate = await deleteImage({ id: image_data_delete.id });
    await RecacheDataPost({
      key,
      car_type_id_key: postExists.car_type_id + key,
      type_of_fual_id_key: postExists.type_of_fual_id + key,
      user_id_key: postExists.user_id + key,
      post_status_key: postExists.status_id + key,
    });
    return SendSuccess({
      res,
      message: `${EMessage.deleteSuccess} update ${imageType}`,
      data: imageUpdate,
    });
  } catch (err) {
    return SendErrorLog({
      res,
      message: `${EMessage.serverError} ${EMessage.deleteFailed} ${imageType}`,
      err,
    });
  }
};

export const Post_doc_imageController = {
  async insertImage(req, res) {
    return InsertPostImage(
      req,
      res,
      "post_doc_image",
      Post_doc_image.insertOne
    );
  },
  async updateImage(req, res) {
    return UpdatePostImage(
      req,
      res,
      "post_doc_image",
      Post_doc_image.findUnique,
      Post_doc_image.update
    );
  },
  async deleteImage(req, res) {
    return DeletePostImage(
      req,
      res,
      "post_doc_image",
      Post_doc_image.findUnique,
      Post_doc_image.deleteWhere
    );
  },
};

export const Post_driver_license_imageController = {
  async insertImage(req, res) {
    return InsertPostImage(
      req,
      res,
      "post_driver_license_image",
      Post_driver_license_image.insertOne
    );
  },
  async updateImage(req, res) {
    return UpdatePostImage(
      req,
      res,
      "post_driver_license_image",
      Post_driver_license_image.findUnique,
      Post_driver_license_image.update
    );
  },
  async deleteImage(req, res) {
    return DeletePostImage(
      req,
      res,
      "post_driver_license_image",
      Post_driver_license_image.findUnique,
      Post_driver_license_image.deleteWhere
    );
  },
};

export const Post_car_imageController = {
  async insertImage(req, res) {
    return InsertPostImage(
      req,
      res,
      "post_car_image",
      Post_car_image.insertOne
    );
  },
  async updateImage(req, res) {
    return UpdatePostImage(
      req,
      res,
      "post_car_image",
      Post_car_image.findUnique,
      Post_car_image.update
    );
  },
  async deleteImage(req, res) {
    return DeletePostImage(
      req,
      res,
      "post_car_image",
      Post_car_image.findUnique,
      Post_car_image.deleteWhere
    );
  },
};

export const Post_insurance_imageController = {
  async insertImage(req, res) {
    return InsertPostImage(
      req,
      res,
      "post_insurance_image",
      Post_insurance_image.insertOne
    );
  },
  async updateImage(req, res) {
    return UpdatePostImage(
      req,
      res,
      "post_insurance_image",
      Post_insurance_image.findUnique,
      Post_insurance_image.update
    );
  },
  async deleteImage(req, res) {
    return DeletePostImage(
      req,
      res,
      "post_insurance_image",
      Post_insurance_image.findUnique,
      Post_insurance_image.deleteWhere
    );
  },
};
