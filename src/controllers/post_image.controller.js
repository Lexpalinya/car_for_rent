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
const InsertPostImage = async (req, res, imageType, InsertImage) => {
  try {
    const post_id = req.params.post_id;
    const data = req.files;
    if (!data || !data[imageType]) {
      return SendError(res, 400, `${EMessage.pleaseInput}: ${imageType}`);
    }
    const [postExists] = await Promise.all([FindPostById_for_edit(post_id)]);
    if (!postExists) {
      return SendError(res, `${EMessage.notFound}:  post id`);
    }
    const imageUrl = await UploadImage(data[imageType].data);
    const post_image = await InsertImage({ post_id, url: imageUrl });
    return SendSuccess(
      res,
      `${EMessage.insertSuccess} ${imageType}`,
      post_image
    );
  } catch (error) {
    return SendErrorLog(
      res,
      `${EMessage.serverError} ${EMessage.insertFailed} ${imageType}`,
      error
    );
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
    let { image_data } = req.body;

    if (!image_data) {
      return SendError(res, 400, `${EMessage.pleaseInput}: ${imageType}`);
    }

    if (typeof image_data === "string") {
      image_data = JSON.parse(image_data);
    }

    if (!image_data.id || !image_data.url) {
      return SendError(
        res,
        400,
        `${EMessage.pleaseInput}: ${imageType} type object {id,post_id,url}`
      );
    }

    const data = req.files;

    if (!data || !data[imageType]) {
      return SendError(res, 400, `${EMessage.pleaseInput}: ${imageType}`);
    }

    const [postExists, imageExists] = await Promise.all([
      FindPostById_for_edit(id),
      findImageById(image_data.id),
    ]);

    if (!postExists || imageExists) {
      return SendError(
        res,
        `${EMessage.notFound}: ${!postExists ? "post" : imageType} id`
      );
    }

    const imageUrl = await UploadImage(data[imageType].data, image_data.url);

    if (!imageUrl) {
      throw new Error(`upload ${imageType} failed`);
    }

    const imageUpdate = await updateImage(image_data.id);

    return SendSuccess(
      res,
      `${EMessage.updateSuccess} update ${imageType}`,
      imageUpdate
    );
  } catch (error) {
    return SendErrorLog(
      res,
      `${EMessage.serverError} ${EMessage.updateFailed} ${imageType}`,
      error
    );
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
    let { image_data } = req.body;

    if (!image_data) {
      return SendError(res, 400, `${EMessage.pleaseInput}: ${imageType}`);
    }

    if (typeof image_data === "string") {
      image_data = JSON.parse(image_data);
    }

    if (!image_data.id || !image_data.url) {
      return SendError(
        res,
        400,
        `${EMessage.pleaseInput}: ${imageType} type object {id,post_id,url}`
      );
    }

    const [postExists, imageExists] = await Promise.all([
      FindPostById_for_edit(id),
      findImageById(image_data.id),
    ]);

    if (!postExists || imageExists) {
      return SendError(
        res,
        `${EMessage.notFound}: ${!postExists ? "post" : imageType} id`
      );
    }
    const delImage = await DeleteImage(image_data.url);
    console.log("delImage :>> ", delImage);
    const imageUpdate = await deleteImage({ id: image_data.id });
    return SendSuccess(
      res,
      `${EMessage.deleteSuccess} update ${imageType}`,
      imageUpdate
    );
  } catch (error) {
    return SendErrorLog(
      res,
      `${EMessage.serverError} ${EMessage.deleteFailed} ${imageType}`,
      error
    );
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
      Post_doc_image.updateImage
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
