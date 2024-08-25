import { CachDataLimit } from "../services/cach.contro";
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
  Post_label_data,
  Post_like_posts,
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
        labels_data,
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
      if (typeof post_rent_data === "string") {
        post_rent_data = JSON.parse(post_rent_data);
      }
      post_rent_data = EnsureArray(post_rent_data);

      post_doc_image = EnsureArray(post_doc_image);

      post_driver_license_image = EnsureArray(post_driver_license_image);

      post_car_image = EnsureArray(post_car_image);
      labels_data = EnsureArray(labels_data);

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

      if (labels_data) {
        const labelChecks = labels_data.map(async (id) => {
          const label = await FindLablesById(id);
          if (!label) {
            SendError(res, `${EMessage.notFound} label with id: ${id}`);
            return false; // Indicate a failure in finding a label
          }
          return true; // Indicate success in finding a label
        });
        await Promise.all(labelChecks);
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
      const add_post_doc_image = AddPost_id_url(post_doc_images_url, post.id);
      const add_post_car_image = AddPost_id_url(post_car_images_url, post.id);

      const add_post_rent_data = AddDataPost_rent_data(post_rent_data, post.id);
      let label_data_as_post_id;
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
      if (labels_data) {
        label_data_as_post_id = AddDataPostLable_data(labels_data, post.id);
        promiseAdd.push(Post_label_data.insert(label_data_as_post_id));
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

  async Update(req, res) {
    try {
      const id = req.params.id;
      const postExists = await FindPostById_for_edit(id);
      if (typeof data.star !== "number") {
        data.star = parseFloat(data.star);
      }
      if (typeof data.deposits_fee !== "number") {
        data.deposits_fee = parseFloat(data.deposits_fee);
      }
      if (data.car_insurance && typeof data.car_insurance !== "boolean") {
        data.car_insurance = data.car_insurance === "true";
      }

      if (!postExists) {
        return SendError(res, `${EMessage.notFound}: post id`);
      }
      const data = DataExists(req.body);
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

        return SendError(res, 404, `${EMessage.notFound}: ${notFoundEntity}`);
      }
      const post = await prisma.posts.update({
        where: {
          id,
        },
        data,
      });
      return SendSuccess(
        res,
        `${EMessage.updateSuccess} post single data`,
        post
      );
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} post`,
        error
      );
    }
  },

  async UpdatePost_doc_image(req, res) {
    try {
      const id = req.params.id;
      let { post_doc_image_data } = req.body;
      if (!post_doc_image_data) {
        return SendError(res, 400, `${EMessage.pleaseInput}: post_doc_image `);
      }
      if (typeof post_doc_image_data === "string") {
        post_doc_image_data = JSON.parse(post_doc_image_data);
      }
      if (!post_doc_image_data.id || !post_doc_image_data.url) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: post_doc_image type object {id,post_id,url}`
        );
      }
      const data = req.files;
      if (!data || !data.post_doc_image) {
        return SendError(res, 400, `${EMessage.pleaseInput}: post_doc_image`);
      }
      const [postExists, post_doc_imageExists] = await Promise.all([
        FindPostById_for_edit(id),
        Post_doc_image.findUnique({ id: post_doc_image_data.id }),
      ]);

      if (!postExists || post_doc_imageExists) {
        return SendError(
          res,
          `${EMessage.notFound}: ${!postExists ? "post" : "post_doc_image"}id`
        );
      }
      const post_doc_image_url = await UploadImage(
        data.post_doc_image.data,
        post_doc_image_data.url
      );
      if (!post_doc_image_url) {
        throw new Error("upload post_doc_image failed");
      }
      const post_doc_image_Update = await Post_doc_image.update(
        post_doc_image_data.id
      );
      return SendSuccess(
        res,
        `${EMessage.updateSuccess} update post_doc_image`,
        post_doc_image_Update
      );
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} post`,
        error
      );
    }
  },
  //----------------------------------------------

  async UpdatePost_driver_license_image(req, res) {
    try {
      const id = req.params.id;
      let { post_driver_license_image } = req.body;
      if (!post_driver_license_image) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: post_driver_license_image `
        );
      }
      if (typeof post_driver_license_image === "string") {
        post_driver_license_image = JSON.parse(post_driver_license_image);
      }
      if (!post_driver_license_image.id || !post_driver_license_image.url) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: post_driver_license_image type object {id,post_id,url}`
        );
      }
      const data = req.files;
      if (!data || !data.post_driver_license_image) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: post_driver_license_image`
        );
      }
      const [postExists, post_car_imageExists] = await Promise.all([
        FindPostById_for_edit(id),
        Post_driver_license_image.findUnique({
          id: post_driver_license_image.id,
        }),
      ]);

      if (!postExists || post_car_imageExists) {
        return SendError(
          res,
          `${EMessage.notFound}: ${!postExists ? "post" : "post_car_image"}id`
        );
      }
      const post_driver_license_image_url = await UploadImage(
        data.post_driver_license_image.data,
        post_driver_license_image.url
      );
      if (!post_driver_license_image_url) {
        throw new Error("upload post_driver_license_image failed");
      }
      const post_drvier_license_Update = await Post_driver_license_image.update(
        post_driver_license_image.id
      );
      return SendSuccess(
        res,
        `${EMessage.updateSuccess} update post_drvier_license`,
        post_drvier_license_Update
      );
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} post`,
        error
      );
    }
  },
  async UpdatePost_car_image(req, res) {
    try {
      const id = req.params.id;
      let { post_car_image_data } = req.body;
      if (!post_car_image_data) {
        return SendError(res, 400, `${EMessage.pleaseInput}: post_car_image `);
      }
      if (typeof post_car_image_data === "string") {
        post_car_image_data = JSON.parse(post_car_image_data);
      }
      if (!post_car_image_data.id || !post_car_image_data.url) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: post_car_image type object {id,post_id,url}`
        );
      }
      const data = req.files;
      if (!data || !data.post_car_image) {
        return SendError(res, 400, `${EMessage.pleaseInput}: post_car_image`);
      }
      const [postExists, post_car_imageExists] = await Promise.all([
        FindPostById_for_edit(id),
        Post_car_image.findUnique({ id: post_car_image_data.id }),
      ]);

      if (!postExists || post_car_imageExists) {
        return SendError(
          res,
          `${EMessage.notFound}: ${!postExists ? "post" : "post_car_image"}id`
        );
      }
      const post_car_image_url = await UploadImage(
        data.post_car_image.data,
        post_car_image_data.url
      );
      if (!post_car_image_url) {
        throw new Error("upload post_car_image failed");
      }
      const post_car_image_Update = await Post_car_image.update(
        post_car_image_data.id
      );
      return SendSuccess(
        res,
        `${EMessage.updateSuccess} update post_car_image`,
        post_car_image_Update
      );
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} post`,
        error
      );
    }
  },
  //---------------------------------------------
  async UpdatePos_insurance_image(req, res) {
    try {
      const id = req.params.id;
      let { post_insurance_image_data } = req.body;
      if (!post_insurance_image_data) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: post_insurance_image `
        );
      }
      if (typeof post_insurance_image_data === "string") {
        post_insurance_image_data = JSON.parse(post_insurance_image_data);
      }
      if (!post_insurance_image_data.id || !post_insurance_image_data.url) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: post_insurance_image type object {id,post_id,url}`
        );
      }
      const data = req.files;
      if (!data || !data.post_insurance_image) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: post_insurance_image`
        );
      }
      const [postExists, post_insurance_imageExists] = await Promise.all([
        FindPostById_for_edit(id),
        Post_insurance_image.findUnique({ id: post_insurance_image_data.id }),
      ]);

      if (!postExists || post_insurance_imageExists) {
        return SendError(
          res,
          `${EMessage.notFound}: ${
            !postExists ? "post" : "post_insurance_image"
          }id`
        );
      }
      const post_insurance_image_url = await UploadImage(
        data.post_insurance_image.data,
        post_insurance_image_data.url
      );
      if (!post_insurance_image_url) {
        throw new Error("upload post_insurance_image failed");
      }
      const post_insurance_image_Update = await post_insurance_image.update(
        post_insurance_image_data.id
      );
      return SendSuccess(
        res,
        `${EMessage.updateSuccess} update post_insurance_image`,
        post_insurance_image_Update
      );
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} post`,
        error
      );
    }
  },
  async UpdatePost_rent_data(req, res) {
    try {
      const post_id = req.params.id;
      let { id, title, price, deposit, system_cost, total } = req.body;
      if (typeof price !== "number") {
        price = parseFloat(price);
      }
      if (typeof deposit !== "number") {
        deposit = parseFloat(deposit);
      }
      if (typeof system_cost !== "number") {
        system_cost = parseFloat(system_cost);
      }
      if (typeof total !== "number") {
        system_cost = parseFloat(system_cost);
      }

      const postExists = await FindPostById_for_edit(post_id);
      if (!postExists) {
        return SendError(res, `${EMessage.notFound}: post id`);
      }
      const post_rent_dataExists = await Post_rent_data.findUnique({ id });
      if (!post_rent_dataExists) {
        return SendError(res, `${EMessage.notFound}: post_rent_data id`);
      }
      const post_rent_data = await Post_rent_data.update(id, {
        title,
        price,
        deposit,
        system_cost,
        total,
      });
      return SendSuccess(
        res,
        `${EMessage.updateSuccess} update post_insurance_image`,
        post_rent_data
      );
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} post`,
        error
      );
    }
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const postExists = await FindPostById_for_edit(id);
      if (!postExists) {
        return SendError(res, `${EMessage.notFound}: post id`);
      }
      const post = await prisma.posts.update({
        where: { id },
        data: { is_active: false },
      });
      return SendSuccess(res, `${EMessage.deleteSuccess}`, post);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} post`,
        error
      );
    }
  },

  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const post = await FindPostById(id);
      if (!post) {
        return SendError(res, `${EMessage.notFound}: post id`);
      }
      return SendSuccess(res, `${EMessage.fetchAllSuccess} post`, post);
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
  async SelectAllPageByCar_type_Id(req, res) {
    try {
      let page = parseInt(req.query.page);
      const { car_type_id } = req.body;
      page = !page || page < 0 ? 0 : page - 1;
      const user = await CachDataLimit(
        key + "-" + page,
        model,
        { car_type_id, is_active: true },
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
  async SelectAllPageByType_of_fuals_Id(req, res) {
    try {
      let page = parseInt(req.query.page);
      const { type_of_fual_id } = req.body;
      page = !page || page < 0 ? 0 : page - 1;
      const user = await CachDataLimit(
        key + "-" + page,
        model,
        { type_of_fual_id, is_active: true },
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

const AddDataPostLable_data = (arr, id) => {
  return arr.map((data) => ({
    post_id: id,
    label_id,
    data,
  }));
};
