import { CachDataLimit } from "../services/cach.contro";
import { EMessage } from "../services/enum";
import {
  FindCar_BrandsById,
  FindCar_typesById,
  FindInsurance_CompanysById,
  FindLevel_InsurancesById,
  FindPost_StatusById,
  FindType_of_FualsById,
  FindUserById_ID,
} from "../services/find";
import {
  AddPost_id_url,
  EnsureArray,
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
import { ValidatePost } from "../services/validate";
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
  car_version: true,
  car_year: true,
  car_resgistration: true,
  type_of_fual_id: true,
  driver_system: true,
  seat: true,
  car_color: true,
  description: true,
  address: true,
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
  labels_data: true,
  like_post: {
    select: {
      user_id: true,
    },
  },
};
const PostController = {
  async Insert(req, res) {
    try {
      const validate = ValidatePost(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      let {
        car_type_id,
        user_id,
        frist_name,
        last_name,
        birth_day,
        nationnality,
        doc_type,
        car_insurance,
        car_brand_id,
        car_version,
        car_year,
        car_resgistration,
        type_of_fual_id,
        driver_system,
        seat,
        car_color,
        description,
        address,
        deposits_fee,
        status_id,
        //
        insurance_company_id,
        level_insurance_id,
        //
        post_rent_data,
      } = req.body;
      const data = req.files;
      if (typeof car_insurance !== "boolean") {
        car_insurance = car_insurance === "true";
      }

      if (typeof deposits_fee !== "number") {
        deposits_fee = parseFloat(deposits_fee);
      }
      if (
        (car_insurance && !insurance_company_id) ||
        (car_insurance && !level_insurance_id)
      )
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${
            !insurance_company_id
              ? "insurance_company_id"
              : "level_insurance_id"
          }`
        );
      if (!data)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}:post_doc_image,post_driver_license_image,post_car_image`
        );

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
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}:${
            !post_doc_image
              ? "post_doc_image"
              : !post_driver_license_image
              ? "post_driver_license_image"
              : !post_car_image
              ? "post_car_image"
              : "post_insurance_image"
          }`
        );
      //--------------------
      post_rent_data = JSON.parse(post_rent_data);
      post_rent_data = EnsureArray(post_rent_data);

      post_doc_image = EnsureArray(post_doc_image);

      post_driver_license_image = EnsureArray(post_driver_license_image);

      post_car_image = EnsureArray(post_car_image);

      if (car_insurance) {
        post_insurance_image = EnsureArray(post_insurance_image);
      }
      for (const i of post_rent_data) {
        if (!i.title) {
          return SendError(
            res,
            400,
            `${EMessage.pleaseInput}: post_rent_data title`
          );
        }
        if (!i.system_cost || typeof i.system_cost != "number") {
          return SendError(
            res,
            400,
            `${EMessage.pleaseInput}: post_rent_data system_cost and type number`
          );
        }
        if (!i.price || typeof i.price !== "number") {
          return SendError(
            res,
            400,
            `${EMessage.pleaseInput}: post_rent_data price and type number`
          );
        }

        if (!i.deposit || typeof i.deposit !== "number") {
          return SendError(
            res,
            400,
            `${EMessage.pleaseInput}: post_rent_data deposit and type number`
          );
        }

        if (!i.total || typeof i.total !== "number") {
          return SendError(
            res,
            400,
            `${EMessage.pleaseInput}: post_rent_data total and type number`
          );
        }
      }
      let promiseList = [
        FindCar_typesById(car_type_id),
        FindUserById_ID(user_id),
        FindCar_BrandsById(car_brand_id),
        FindType_of_FualsById(type_of_fual_id),
        FindPost_StatusById(status_id),
      ];
      if (car_insurance) {
        promiseList.push(FindInsurance_CompanysById(insurance_company_id));
        promiseList.push(FindLevel_InsurancesById(level_insurance_id));
      }
      const [
        car_typeExists,
        userExists,
        car_brandExists,
        type_of_fualExists,
        post_statusExists,
        insurance_companyExists,
        level_insuranceExists,
      ] = await Promise.all(promiseList);
      if (
        !car_typeExists ||
        !userExists ||
        !car_brandExists ||
        !type_of_fualExists ||
        !post_statusExists ||
        (car_insurance && !insurance_companyExists) ||
        (car_insurance && !level_insuranceExists)
      )
        return SendError(
          res,
          404,
          `${EMessage.notFound}:${
            !car_typeExists
              ? "car_types"
              : !userExists
              ? "users"
              : !car_brandExists
              ? "car_brands"
              : !type_of_fualExists
              ? "type_of_fuals"
              : !post_statusExists
              ? "post_status"
              : car_insurance && !insurance_companyExists
              ? "insurance_companys"
              : "level_insurances"
          } id`
        );
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
          car_version,
          car_year,
          car_resgistration,
          type_of_fual_id,
          driver_system,
          seat,
          car_color,
          description,
          address,
          deposits_fee,
          status_id,
        },
      });

      const add_post_driver_license_image = AddPost_id_url(
        post_driver_license_image_url,
        post.id
      );
      const add_post_rent_data = AddDataPost_rent_data(post_rent_data, post.id);
      const add_post_doc_image = AddPost_id_url(post_doc_images_url, post.id);
      const add_post_car_image = AddPost_id_url(post_car_images_url, post.id);
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

      return SendSuccess(res, `${EMessage.insertSuccess}`, post);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} post`,
        error
      );
    }
  },
  async SelectAllPage(req, res) {
    try {
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
      return SendSuccess(res, `${EMessage.fetchOneSuccess} user`, user);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        error
      );
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
