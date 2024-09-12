import { EMessage } from "../services/enum";
import { FindKycById } from "../services/find";
import {
  AddKyc_id_url,
  EnsureArray,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { Kyc_doc_image } from "../services/subtabel";
import {
  DeleteImage,
  UploadImage,
  uploadImages,
} from "../services/upload.file";
import prisma from "../utils/prisma.client";
import { ReDataInCacheKyc } from "./kyc.controller";
import { RecacheData } from "./user.controller";
const key = "kycs";

const Kyc_doc_imageController = {
  async Insert(req, res) {
    try {
      const id = req.params.id;
      const data = req.files;
      if (!data || !data.kyc_doc_image)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "kyc_doc_image",
        });
      const kycExists = await FindKycById(id);
      if (!kycExists)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.notFound}`,
          err: "kyc id",
        });
      let kyc_doc_images = EnsureArray(data.kyc_doc_image);
      const kyc_doc_images_url = await uploadImages(kyc_doc_images);
      const add_kyc_doc_images = await AddKyc_id_url(kyc_doc_images_url, id);
      const kyc_doc_image = await Kyc_doc_image.insert(add_kyc_doc_images);
      console.log("kyc_doc_image :>> ", kyc_doc_image);
      const user = await prisma.users.update({
        where: {
          id: kycExists.user_id,
        },
        data: {
          kyc: false,
        },
        select: {
          kyc: true,
        },
      });
      await RecacheData(user.id, { page: true });
      await ReDataInCacheKyc({
        key,
        idkyckey: id + key,
        statuskyckey: kycExists.status,
        userkyckey: kycExists.user_id,
      });
      return SendSuccess({
        res,
        message: `${EMessage.insertSuccess}`,
        data: {
          kyc_doc_image,
        },
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed}`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      let { kyc_doc_image_data } = req.body;
      if (!kyc_doc_image_data)
        return SendError({
          res,
          message: `${EMessage.pleaseInput}`,
          err: "kyc_doc_image_data",
        });

      if (typeof kyc_doc_image_data === "string")
        kyc_doc_image_data = JSON.parse(kyc_doc_image_data);

      const data = req.files;
      if (!data || !data.kyc_doc_image)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "kyc_doc_image",
        });

      if (
        !kyc_doc_image_data ||
        !kyc_doc_image_data.id ||
        !kyc_doc_image_data.url ||
        !kyc_doc_image_data.kyc_id ||
        !kyc_doc_image_data.updated_at
      )
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "kyc_doc_image_data type object {id:number,url,kyc_id,updated_at}",
        });
      const [kycExists, kyc_doc_imagesExists] = await Promise.all([
        FindKycById(id),
        Kyc_doc_image.findUnique({
          id: kyc_doc_image_data.id,
        }),
      ]);
      if (!kycExists || !kyc_doc_imagesExists)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.notFound}`,
          err: `${!kycExists ? "kyc id" : "kyc_doc_image id"} `,
        });
      if (id !== kyc_doc_imagesExists.kyc_id)
        return SendError({
          res,
          statuscode: 400,
          message: `you not own kyc_doc_images`,
          err: `you not own kyc_doc_images`,
        });
      const url = await UploadImage(
        data.kyc_doc_image.data,
        kyc_doc_image_data.url
      );
      if (!url) {
        throw new Error(`upload kyc_doc_image failed`);
      }
      const kyc_doc_image = await Kyc_doc_image.update(kyc_doc_image_data.id, {
        url: url,
      });
      const user = await prisma.users.update({
        where: {
          id: kycExists.user_id,
        },
        data: {
          kyc: false,
        },
        select: {
          kyc: true,
        },
      });
      await RecacheData(user.id, { page: true });
      await ReDataInCacheKyc({
        key,
        idkyckey: id + key,
        statuskyckey: kycExists.status,
        userkyckey: kycExists.user_id,
      });

      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: {
          kyc_doc_image,
        },
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
      let { kyc_doc_image_data } = req.body;
      if (typeof kyc_doc_image_data === "string")
        kyc_doc_image_data = JSON.parse(kyc_doc_image_data);
      if (
        !kyc_doc_image_data ||
        !kyc_doc_image_data.id ||
        !kyc_doc_image_data.url ||
        !kyc_doc_image_data.kyc_id ||
        !kyc_doc_image_data.updated_at
      )
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "kyc_doc_image_data type object {id:number,url,kyc_id,updated_at}",
        });
      const [kycExists, kyc_doc_imagesExists] = await Promise.all([
        FindKycById(id),
        Kyc_doc_image.findUnique({
          id: kyc_doc_image_data.id,
        }),
      ]);
      if (!kycExists || !kyc_doc_imagesExists)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.notFound}`,
          err: `${!kycExists ? "kyc id" : "kyc_doc_image id"} `,
        });
      if (id !== kyc_doc_imagesExists.kyc_id)
        return SendError({
          res,
          statuscode: 400,
          message: `you not own kyc_doc_images`,
          err: `you not own kyc_doc_images`,
        });
      const delImage = await DeleteImage(kyc_doc_image_data.url);
      console.log("delImage :>> ", delImage);
      const kyc_doc_images = await Kyc_doc_image.delete(kyc_doc_image_data.id);
      const user = await prisma.users.update({
        where: {
          id: kycExists.user_id,
        },
        data: {
          kyc: false,
        },
        select: {
          kyc: true,
        },
      });
      await RecacheData(user.id, { page: true });
      await ReDataInCacheKyc({
        key,
        idkyckey: id + key,
        statuskyckey: kycExists.status,
        userkyckey: kycExists.user_id,
      });

      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        kyc_doc_images,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed}`,
        err,
      });
    }
  },
};
export default Kyc_doc_imageController;
