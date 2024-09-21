import redis from "../DB/redis";
import { broadcast } from "../server/socketIO.server";
import { CachDataAll, CachDataLimit } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import { FindKycById, FindUserById_ID } from "../services/find";
import {
  AddKyc_id_url,
  EnsureArray,
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { Kyc_doc_image } from "../services/subtabel";
import { uploadImages } from "../services/upload.file";
import { DataExists, ValidateKyc } from "../services/validate";
import prisma from "../utils/prisma.client";
import { RecacheData } from "./user.controller";
const key = "kycs";
const model = "kycs";
let where = { is_active: true };
let select = {
  id: true,
  is_active: true,
  status: true,
  user_type: true,
  first_name: true,
  last_name: true,
  birthday: true,
  nationality: true,
  doc_type: true,
  point: true,
  village: true,
  district: true,
  province: true,
  user_id: true,
  created_at: true,
  updated_at: true,
  kyc_doc_image: true,
};

export const ReDataInCacheKyc = async ({
  key,
  userkyckey,
  statuskyckey,
  idkyckey,
}) => {
  const promise = [];
  if (key) promise.push(DeleteCachedKey(key));
  if (userkyckey) promise.push(DeleteCachedKey(userkyckey));
  if (statuskyckey) promise.push(DeleteCachedKey(statuskyckey));
  if (idkyckey) promise.push(redis.del(idkyckey));
  await Promise.all(promise);
  console.log(`Deleted kyc cache key successfully`);
};
const KycController = {
  async Insert(req, res) {
    try {
      const validate = ValidateKyc(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: `${validate.join(", ")}`,
        });
      let {
        user_type,
        first_name,
        last_name,
        birthday,
        nationality,
        phone_number,
        doc_type,
        point,
        village,
        district,
        province,
      } = req.body;
      const data = req.files;
      if (!data || !data.doc_image)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "doc_image",
        });
      const user_id = req.user;
      if (typeof user_type !== "boolean") user_type = user_type === "true";
      const userExists = await FindUserById_ID(user_id);
      if (!userExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: "user_id",
        });
      let doc_image_list = data.doc_image;
      doc_image_list = EnsureArray(doc_image_list);
      const kyc_doc_image_list = await uploadImages(doc_image_list);
      const kyc = await prisma.kycs.create({
        data: {
          user_type,
          first_name,
          last_name,
          birthday,
          nationality,
          phone_number,
          doc_type,
          user_id,
          point,
          village,
          district,
          province,
        },
      });

      const add_kyc_doc_image = AddKyc_id_url(kyc_doc_image_list, kyc.id);

      const kyc_doc_image = await Kyc_doc_image.insert(add_kyc_doc_image);
      console.log("kyc_doc_image :>> ", kyc_doc_image);
      await ReDataInCacheKyc({
        key,
        // idkyckey: id + key,
        statuskyckey: "false" + key,
        userkyckey: user_id + key,
      });
      broadcast({ client_id: "admin", ctx: "kyc", data: "kyc new" });
      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: kyc,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed}`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      if (data.status && typeof data.status !== "boolean")
        data.status = data.status === "true";
      if (data.user_type && typeof data.user_type !== "boolean")
        data.user_type = data.user_type === "true";
      let promiseList = [FindKycById(id)];
      if (data.user_id) promiseList.push(FindUserById_ID(data.user_id));
      const [kycExists, userExists] = await Promise.all(promiseList);
      if (!kycExists || (data.user_id && !userExists))
        return SendError({
          res,
          message: `${EMessage.notFound}`,
          err: `${!kycExists ? "kyc id" : "user_id"}`,
        });
      const kyc = await prisma.kycs.update({
        where: {
          id,
        },
        data,
      });
      await Promise.all([
        ReDataInCacheKyc({
          key,
          idkyckey: id + key,
          statuskyckey: kycExists.status,
          userkyckey: kycExists.user_id,
        }),
        ReDataInCacheKyc({
          key,
          idkyckey: id + key,
          statuskyckey: kyc.status,
          userkyckey: kyc.user_id,
        }),
      ]);
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: kyc,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed}`,
        err,
      });
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const kycExists = await FindKycById(id);
      if (!kycExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: "user_id",
        });
      const kyc = await prisma.kycs.update({
        where: {
          id,
        },
        data: {
          is_active: false,
        },
      });
      await ReDataInCacheKyc({
        key,
        idkyckey: id + key,
        statuskyckey: kycExists.status + key,
        userkyckey: kycExists.user_id + key,
      });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: kyc,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed}`,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const kyc = await FindKycById(id);
      if (!kyc)
        return SendError({
          res,
          message: `${EMessage.notFound} kyc`,
          err: `id`,
        });
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess}`,
        data: kyc,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        err,
      });
    }
  },
  async SelectAll(req, res) {
    try {
      let page = req.params.page;
      page = parseInt(page, 10);
      page = !page || page < 0 ? 0 : page - 1;
      const [kycs] = await Promise.all([
        CachDataLimit(key + "-" + page, model, where, page, select),
        CachDataLimit(key + "-" + (page + 1), model, where, page + 1, select),
      ]);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: kycs,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll}`,
        err,
      });
    }
  },
  async SelectByUserID(req, res) {
    try {
      const user_id = req.params.id;
      const kyc = await CachDataAll(
        user_id + key,
        model,
        {
          is_active: true,
          user_id,
        },
        select
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess}`,
        data: kyc,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        mmessage: `${EMessage.serverError} ${EMessage.fetchAllSuccess}`,
        err,
      });
    }
  },
  async SelectByStatus(req, res) {
    try {
      let { status, page } = req.query;
      page = parseInt(page, 10);
      page = page > 0 || !page ? 0 : page - 1;
      if (typeof status !== "boolean") status = status === "true";
      const [kyc] = await Promise.all([
        CachDataLimit(
          status + key + page,
          model,
          {
            is_active: true,
            status,
          },
          page,
          select
        ),
        CachDataLimit(
          status + key + (page + 1),
          model,
          {
            is_active: true,
            status,
          },
          page + 1,
          select
        ),
      ]);
      return SendSuccess({
        res,
        message: `${EMessage.serverError} ${EMessage.fetchAllSuccess}Success`,
        data: kyc,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll}`,
        err,
      });
    }
  },
  async UpdateStatus(req, res) {
    try {
      const id = req.params.id;
      let { status } = req.query;
      if (!status)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "status  in query parameter",
        });
      if (typeof status !== "boolean") status = status === "true";
      const kycExists = await FindKycById(id);
      if (!kycExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound} kyc`,
          err: "kyc",
        });
      const kyc = await prisma.kycs.update({
        where: {
          id,
        },
        data: {
          status: status,
        },
      });
      const user = await prisma.users.update({
        where: {
          id: kycExists.user_id,
        },
        data: {
          kyc: status,
        },
        select: {
          kyc: true,
        },
      });
      await Promise.all([
        ReDataInCacheKyc({
          key,
          idkyckey: id + key,
          statuskyckey: kycExists.status,
          userkyckey: kycExists.user_id,
        }),

        ReDataInCacheKyc({
          key,
          idkyckey: id + key,
          statuskyckey: kyc.status,
          userkyckey: kyc.user_id,
        }),
        RecacheData(user.id, { page: true }),
      ]);
      broadcast({ client_id: "admin", ctx: "kyc", data: "kyc success" });
      broadcast({
        client_id: kycExists.user_id,
        ctx: "kyc",
        data: `you have been ${
          kyc.status ? "approved" : "removed"
        }by the admin`,
      });
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess} status and kyc user status`,
        data: {
          kyc,
          user,
        },
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} status and  kyc user status`,
        err,
      });
    }
  },
};
export default KycController;
