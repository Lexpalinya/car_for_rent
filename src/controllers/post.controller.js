import redis from "../DB/redis";
import { CachDataAll, CachDataLimit } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import {
  FindCar_BrandsById,
  FindCar_typesById,
  FindInsurance_CompanysById,
  FindLablesById,
  FindLevel_InsurancesById,
  FindPost_StatusById,
  FindPostById,
  FindPostById_for_edit,
  FindType_of_FualsById,
  FindUserById_ID,
} from "../services/find";
import {
  AddPost_id_url,
  EnsureArray,
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import {
  Post_car_image,
  Post_doc_image,
  Post_driver_license_image,
  Post_insurance_image,
  Post_rent_data,
} from "../services/subtabel";
import { UploadImage, uploadImages } from "../services/upload.file";
import { DataExists, ValidatePost } from "../services/validate";
import prisma from "../utils/prisma.client";
let key = "posts";
const model = "posts";
let where = { is_active: true };
let select = {
  id: true,
  is_active: true,
  car_type_id: true,
  user_id: true,
  star: true,
  frist_name: true,
  last_name: true,
  birth_day: true,
  nationnality: true,
  doc_type: true,
  car_insurance: true,
  insurance_company_id: true,
  level_insurance_id: true,
  car_brand_id: true,
  car_brand: true,
  car_version: true,
  car_year: true,
  car_resgistration: true,
  type_of_fual_id: true,
  driver_system: true,
  seat: true,
  car_color: true,
  description: true,
  street: true,
  point: true,
  address: true,
  detail_address: true,
  deposits_fee: true,
  status_id: true,
  created_at: true,
  updated_at: true,
  insurance_company: true,
  level_insurance: true,
  car_brands: true,
  type_of_fual: true,
  status: true,
  users: {
    select: {
      username: true,
      phone_number: true,
    },
  },
  post_doc_image: true,
  post_car_image: true,
  post_driver_license_image: true,
  post_insurance_image: true,
  post_rent_data: true,
  like_post: {
    select: {
      user_id: true,
    },
  },
};
export const RecacheDataPost = async ({
  key,
  car_type_id_key,
  type_of_fual_id_key,
  user_id_key,
}) => {
  let a = [DeleteCachedKey(key)];
  if (car_type_id_key) a.push(DeleteCachedKey(car_type_id_key));
  if (type_of_fual_id_key) a.push(DeleteCachedKey(type_of_fual_id_key));
  if (user_id_key) a.push(DeleteCachedKey(user_id_key));
  await Promise.all(a);
};
const PostController = {
  async Insert(req, res) {
    try {
      const validate = ValidatePost(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      let {
        car_type_id,
        frist_name,
        last_name,
        birth_day,
        nationnality,
        doc_type,
        car_insurance,
        car_brand,
        car_version,
        car_year,
        car_resgistration,
        type_of_fual_id,
        driver_system,
        seat,
        car_color,
        description,
        street,
        point,
        address,
        detail_address,
        deposits_fee,
        status_id,
        //
        post_rent_data,
        //
        car_brand_id,
        insurance_company_id,
        level_insurance_id,
      } = req.body;
      const user_id = req.user;
      const data = req.files;
      if (typeof car_insurance !== "boolean") {
        car_insurance = car_insurance === "true";
      }

      if (typeof deposits_fee !== "number") {
        deposits_fee = parseFloat(deposits_fee);
      }
      if (
        (car_insurance && !insurance_company_id) ||
        (car_insurance && !level_insurance_id) ||
        (car_insurance && !car_brand_id)
      )
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: ` ${
            !insurance_company_id
              ? "insurance_company_id"
              : !level_insurance_id
              ? "level_insurance_id"
              : "car_brand_id"
          }`,
        });
      if (!data)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "post_doc_image,post_driver_license_image,post_car_image",
        });

      let post_doc_image = data.post_doc_image;
      let post_driver_license_image = data.post_driver_license_image;
      let post_car_image = data.post_car_image;
      let post_insurance_image = data.post_insurance_image;
      if (
        !post_doc_image ||
        !post_driver_license_image ||
        !post_car_image ||
        (car_insurance && !post_insurance_image)
      )
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: `${
            !post_doc_image
              ? "post_doc_image"
              : !post_driver_license_image
              ? "post_driver_license_image"
              : !post_car_image
              ? "post_car_image"
              : "post_insurance_image"
          } id`,
        });
      //--------------------
      if (typeof post_rent_data === "string") {
        post_rent_data = JSON.parse(post_rent_data);
      }

      post_rent_data = EnsureArray(post_rent_data);

      post_doc_image = EnsureArray(post_doc_image);

      post_driver_license_image = EnsureArray(post_driver_license_image);

      post_car_image = EnsureArray(post_car_image);

      if (car_insurance) {
        post_insurance_image = EnsureArray(post_insurance_image);
      }
      for (const i of post_rent_data) {
        if (!i.title) {
          return SendError({
            res,
            statuscode: 400,
            message: `${EMessage.pleaseInput}: `,
            err: " post_rent_data{title}",
          });
        }
        if (!i.system_cost || typeof i.system_cost != "number") {
          return SendError({
            res,
            statuscode: 400,
            message: `${EMessage.pleaseInput}:`,
            err: "post_rent_data system_cost and type number",
          });
        }
        if (!i.price || typeof i.price !== "number") {
          return SendError({
            res,
            statuscode: 400,
            message: `${EMessage.pleaseInput}`,
            err: "post_rent_data price and type number",
          });
        }

        if (!i.deposit || typeof i.deposit !== "number") {
          return SendError({
            res,
            statuscode: 400,
            message: `${EMessage.pleaseInput}`,
            err: "post_rent_data deposit and type number",
          });
        }

        if (!i.total || typeof i.total !== "number") {
          return SendError({
            res,
            statuscode: 400,
            message: `${EMessage.pleaseInput}`,
            err: " post_rent_data total and type number",
          });
        }
      }
      let promiseList = [
        FindCar_typesById(car_type_id),
        FindUserById_ID(user_id),
        FindType_of_FualsById(type_of_fual_id),
        FindPost_StatusById(status_id),
      ];
      if (car_insurance) {
        promiseList.push(FindInsurance_CompanysById(insurance_company_id));
        promiseList.push(FindLevel_InsurancesById(level_insurance_id));
        promiseList.push(FindCar_BrandsById(car_brand_id));
      }

      const [
        car_typeExists,
        userExists,
        type_of_fualExists,
        post_statusExists,
        insurance_companyExists,
        level_insuranceExists,
        car_brandExists,
      ] = await Promise.all(promiseList);
      const notFoundEntity = !car_typeExists
        ? "car_types"
        : !userExists
        ? "users"
        : !type_of_fualExists
        ? "type_of_fuals"
        : !post_statusExists
        ? "post_status"
        : car_insurance && !car_brandExists
        ? "car_brands"
        : car_insurance && !insurance_companyExists
        ? "insurance_companys"
        : car_insurance && !level_insuranceExists
        ? "level_insurances"
        : null;

      if (notFoundEntity) {
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: `${notFoundEntity} id`,
        });
      }

      const promiseImageList = [
        uploadImages(post_driver_license_image),
        uploadImages(post_doc_image),
        uploadImages(post_car_image),
      ];
      if (car_insurance) {
        promiseImageList.push(uploadImages(post_insurance_image));
      }
      const [
        post_driver_license_image_url,
        post_doc_images_url,
        post_car_images_url,
        post_insurance_image_url,
      ] = await Promise.all(promiseImageList);

      const post = await prisma.posts.create({
        data: {
          car_type_id,
          user_id,
          frist_name,
          last_name,
          birth_day,
          nationnality,
          doc_type,
          car_insurance,
          insurance_company_id,
          level_insurance_id,
          car_brand_id,
          car_brand,
          car_version,
          car_year,
          car_resgistration,
          type_of_fual_id,
          driver_system,
          seat,
          car_color,
          description,
          street,
          point,
          address,
          detail_address,
          deposits_fee,
          status_id,
        },
      });

      const add_post_driver_license_image = AddPost_id_url(
        post_driver_license_image_url,
        post.id
      );
      const add_post_doc_image = AddPost_id_url(post_doc_images_url, post.id);
      const add_post_car_image = AddPost_id_url(post_car_images_url, post.id);

      const add_post_rent_data = AddDataPost_rent_data(post_rent_data, post.id);

      const promiseAdd = [
        Post_driver_license_image.insert(add_post_driver_license_image),
        Post_doc_image.insert(add_post_doc_image),
        Post_car_image.insert(add_post_car_image),
        Post_rent_data.insert(add_post_rent_data),
      ];

      if (car_insurance) {
        const add_post_insurance_image = AddPost_id_url(
          post_insurance_image_url,
          post.id
        );
        promiseAdd.push(Post_insurance_image.insert(add_post_insurance_image));
      }

      await Promise.all(promiseAdd);
      await RecacheDataPost({
        key,
        car_type_id_key: car_type_id + key,
        type_of_fual_id_key: type_of_fual_id + key,
        user_id_key: user_id + key,
      });
      await redis.del(post.id + "posts-edit");

      return SendCreate({
        res,
        message: `${EMessage.insertSuccess}`,
        data: post,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} post`,
        err,
      });
    }
  },

  async Update(req, res) {
    try {
      const id = req.params.id;
      const postExists = await FindPostById_for_edit(id);
      let data = DataExists(req.body);

      if (data.star && typeof data.star !== "number") {
        data.star = parseFloat(data.star);
      }
      if (data.deposits_fee&&typeof data.deposits_fee !== "number") {
        data.deposits_fee = parseFloat(data.deposits_fee);
      }
      if (data.car_insurance && typeof data.car_insurance !== "boolean") {
        data.car_insurance = data.car_insurance === "true";
      }

      if (!postExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: post id`,
          err: "post_id",
        });

      let promiseFind = [];
      if (data.user_id) {
        promiseFind.push(FindUserById_ID(data.user_id));
      }
      if (data.car_type_id) {
        promiseFind.push(FindCar_typesById(data.car_type_id));
      }
      if (data.car_brand_id) {
        promiseFind.push(FindCar_BrandsById(data.car_brand_id));
      }
      if (data.type_of_fual_id) {
        promiseFind.push(FindType_of_FualsById(data.type_of_fual_id));
      }
      if (data.status_id) {
        promiseFind.push(FindPost_StatusById(data.status_id));
      }
      if (data.insurance_company_id) {
        promiseFind.push(FindInsurance_CompanysById(data.insurance_company_id));
      }
      if (data.level_insurance_id) {
        promiseFind.push(FindLevel_InsurancesById(data.level_insurance_id));
      }
      let userExists,
        car_typeExists,
        car_brandExists,
        type_of_fualExists,
        post_statusExists,
        insurance_companyExists,
        level_insuranceExists;
      let result = await Promise.all(promiseFind);

      if (data.user_id) {
        userExists = result.shift();
      }
      if (data.car_type_id) {
        car_typeExists = result.shift();
      }
      if (data.car_brand_id) {
        car_brandExists = result.shift();
      }
      if (data.type_of_fual_id) {
        type_of_fualExists = result.shift();
      }
      if (data.status_id) {
        post_statusExists = result.shift();
      }
      if (data.insurance_company_id) {
        insurance_companyExists = result.shift();
      }
      if (data.level_insurance_id) {
        level_insuranceExists = result.shift();
      }
      if (
        (data.user_id && !userExists) ||
        (data.car_type_id && !car_typeExists) ||
        (data.car_brand_id && !car_brandExists) ||
        (data.type_of_fual_id && !type_of_fualExists) ||
        (data.status_id && !post_statusExists) ||
        (data.insurance_company_id && !insurance_companyExists) ||
        (data.level_insurance_id && !level_insuranceExists)
      ) {
        const notFoundEntity =
          data.user_id && !userExists
            ? "user"
            : data.car_type_id && !car_typeExists
            ? "car_type"
            : data.car_brand_id && !car_brandExists
            ? "car_brand"
            : data.type_of_fual_id && !type_of_fualExists
            ? "type_of_fuals"
            : data.status_id && !post_statusExists
            ? "post_status"
            : data.insurance_company_id && !insurance_companyExists
            ? "insurance_company"
            : "level_insurance";

        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: `${notFoundEntity} id`,
        });
      }
      const post = await prisma.posts.update({
        where: {
          id,
        },
        data,
      });
      await RecacheDataPost({
        key,
        car_type_id_key: postExists.car_type_id + key,
        type_of_fual_id_key: postExists.type_of_fual_id + key,
        user_id_key: postExists.user_id + key,
      });
      await redis.del(postExists.id + key);

      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess} post single data`,
        data: post,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} post`,
        err,
      });
    }
  },

  async Delete(req, res) {
    try {
      const id = req.params.id;
      const postExists = await FindPostById_for_edit(id);
      if (!postExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: post id`,
          err: "post_id",
        });
      const post = await prisma.posts.update({
        where: { id },
        data: { is_active: false },
      });
      await RecacheDataPost({
        key,
        car_type_id_key: postExists.car_type_id + key,
        type_of_fual_id_key: postExists.type_of_fual_id + key,
        user_id_key: postExists.user_id,
      });
      await redis.del(id + "posts-edit", id + key);
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: post,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} post`,
        err,
      });
    }
  },

  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      // await redis.del(id + key);
      const post = await FindPostById(id);
      if (!post)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: post id`,
          err: "post_id",
        });

      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess} post`,
        data: post,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne} post`,
        err,
      });
    }
  },

  async SelectAllPage(req, res) {
    try {
      // await DeleteCachedKey(key);
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const user = await CachDataLimit(
        key + "-" + page,
        model,
        where,
        page,
        select
      );
      CachDataLimit(key + "-" + (page + 1), model, where, page + 1, select);
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess} user`,
        data: user,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} post select allpage`,
        err,
      });
    }
  },
  async SelectAllPageByCar_type_Id(req, res) {
    try {
      // await DeleteCachedKey(key);
      let page = parseInt(req.query.page);
      const { car_type_id } = req.params;
      page = !page || page < 0 ? 0 : page - 1;
      const user = await CachDataLimit(
        car_type_id + key + "-" + page,
        model,
        { car_type_id: car_type_id, is_active: true },
        page,
        select
      );
      CachDataLimit(
        car_type_id + key + "-" + (page + 1),
        model,
        { car_type_id: car_type_id, is_active: true },
        page + 1,
        select
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess} `,
        data: user,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.fetchAllSuccess}post select by car_type`,
        err,
      });
    }
  },
  async SelectAllPageByType_of_fuals_Id(req, res) {
    try {
      // await DeleteCachedKey(key);
      let page = parseInt(req.query.page);
      const { type_of_fual_id } = req.params;
      page = !page || page < 0 ? 0 : page - 1;
      const user = await CachDataLimit(
        type_of_fual_id + key + "-" + page,
        model,
        { type_of_fual_id, is_active: true },
        page,
        select
      );
      CachDataLimit(
        type_of_fual_id + key + "-" + (page + 1),
        model,
        { type_of_fual_id, is_active: true },
        page + 1,
        select
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: user,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} post select Page by typ_of fual`,
        err,
      });
    }
  },
  async SelectAllByUser(req, res) {
    try {
      // await DeleteCachedKey(key);
      let page = parseInt(req.query.page);
      const user_id = req.user;
      page = !page || page < 0 ? 0 : page - 1;
      const user = await CachDataAll(
        user_id + key + "-" + page,
        model,
        { user_id, is_active: true },
        select
      );
      CachDataAll(
        user_id + key + "-" + (page + 1),
        model,
        { user_id, is_active: true },
        select
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess}`,
        data: user,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne} post select All by user`,
        err,
      });
    }
  },
};
export default PostController;

const AddDataPost_rent_data = (arr, id) => {
  return arr.map((data) => ({
    post_id: id,
    ...data,
  }));
};
