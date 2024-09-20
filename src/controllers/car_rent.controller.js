import redis from "../DB/redis";
import { CachDataAll, CachDataLimit } from "../services/cach.contro";
import { DeleteCachedKey } from "../services/cach.deletekey";
import { EMessage } from "../services/enum";
import {
  FindCar_Rent_StatusById,
  FindCar_rentById,
  FindCar_rentById_for_edit,
  FindPostById_for_edit,
  FindPromotionById_ID,
  FindUserById_ID,
} from "../services/find";
import {
  AddCar_rent_id_url,
  EnsureArray,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import {
  Car_rent_doc_image,
  Car_rent_driving_lincense_image,
  Car_rent_payment_image,
  Car_rent_visa,
} from "../services/subtabel";
import { UploadImage, uploadImages } from "../services/upload.file";
import {
  DataExists,
  ValidateCar_rent,
  ValidateCar_rent_update_status,
} from "../services/validate";
import prisma from "../utils/prisma.client";
const car_rent_status = "a8581879-1cc6-4607-b998-74a79d74dd63";
const car_rent_status_user_approval = "7a55f7c4-4f6e-4992-bf02-66f1c1c47b99";
const car_rent_status_Success = "818ca297-e08a-49ba-88c6-9834459564a1";
const car_rent_status_Failure = "b3b177e3-9f07-4546-ad14-bc96a7d62185";
let key = "car_rent";
let model = "car_rent";
let select = {
  id: true,
  is_active: true,
  user_id: true,
  post_id: true,
  type_rent: true,
  price_rent: true,
  start_date: true,
  end_date: true,
  frist_name: true,
  last_name: true,
  village: true,
  district: true,
  province: true,
  phone_number: true,
  email: true,
  doc_type: true,
  scope: true,
  description: true,
  promotion_id: true,
  discount: true,
  total_price: true,
  booking_fee: true,
  tax: true,
  pay_destination: true,
  khampakan: true,
  pay_type: true,
  bank_no: true,
  pay_status: true,
  reason: true,
  status_id: true,
  admin_id: true,
  is_success: true,
  created_at: true,
  updated_at: true,
  post: {
    select: {
      star: true,
      users: {
        select: {
          profile: true,
          kycs: {
            select: {
              first_name: true,
              last_name: true,
              village: true,
              district: true,
              province: true,
              phone_number: true,
            },
          },
        },
      },

      car_types: true,

      car_version: true,
      car_year: true,
      post_car_image: {
        select: {
          url: true,
        },
      },
    },
  },
  status: true,
  promotion: true,
  car_rent_doc_image: true,
  car_rent_driving_lincense_image: true,
  car_rent_payment_image: true,
  car_rent_visa: true,
};
const ResCachedDataCar_rent = async ({
  id,
  key,
  post_key,
  user_key,
  user_post_key,
  pay_status,
}) => {
  let promise = [
    DeleteCachedKey(key),
    DeleteCachedKey(post_key + key),
    DeleteCachedKey(user_key + key),
    DeleteCachedKey(pay_status + key),
    DeleteCachedKey(user_post_key + key),
  ];
  if (id) {
    promise.push(redis.del(id + key));
  }
  await Promise.all(promise);
};
const Car_rentController = {
  async Insert(req, res) {
    try {
      const validate = ValidateCar_rent(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const user_id = req.user;
      let {
        post_id,
        type_rent,
        price_rent,
        start_date,
        end_date,
        frist_name,
        last_name,
        village,
        district,
        province,
        phone_number,
        email,
        doc_type,
        discount,
        total_price,
        booking_fee,
        tax,
        pay_destination,
        khampakan,
        pay_type,
        description,
        scope,
        //--------
        // reason,
        promotion_id,
        //-------------
        car_rent_visa,
      } = req.body;
      if (typeof price_rent !== "number") price_rent = parseFloat(price_rent);
      if (typeof discount !== "number") discount = parseFloat(discount);
      if (typeof total_price !== "number")
        total_price = parseFloat(total_price);
      if (typeof tax !== "number") tax = parseFloat(tax);
      if (typeof khampakan !== "number") khampakan = parseFloat(khampakan);

      if (typeof booking_fee !== "number")
        booking_fee = parseFloat(booking_fee);
      if (typeof pay_destination !== "number")
        pay_destination = parseFloat(pay_destination);
      const status_id = car_rent_status;
      const data = req.files;
      if (
        !data ||
        !data.car_rent_doc_image ||
        !data.car_rent_payment_image ||
        !data.car_rent_driving_lincense_image
      ) {
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: ` ${
            !data
              ? "car_rent_doc_image,car_rent_payment_image,car_rent_driving_lincense_image"
              : !data.car_rent_doc_image
              ? "car_rent_doc_image"
              : !data.car_rent_driving_lincense_image
              ? "car_rent_driving_lincense_image"
              : "car_rent_payment_image"
          }`,
        });
      }

      if (car_rent_visa && typeof car_rent_visa === "string") {
        car_rent_visa = JSON.parse(car_rent_visa);
        if (
          !car_rent_visa.name ||
          !car_rent_visa.exp_date ||
          !car_rent_visa.cvv
        ) {
          return SendError({
            res,
            statuscode: 400,
            message: `${EMessage.pleaseInput} `,
            err: "car_rent_visa type object {name,exp_date:DateTime,cvv}",
          });
        }
      }

      data.car_rent_doc_image = EnsureArray(data.car_rent_doc_image);
      data.car_rent_driving_lincense_image = EnsureArray(
        data.car_rent_driving_lincense_image
      );
      data.car_rent_payment_image = EnsureArray(data.car_rent_payment_image);
      let promiseFind = [
        FindUserById_ID(user_id),
        FindPostById_for_edit(post_id),
        FindCar_Rent_StatusById(status_id),
      ];
      if (promotion_id) {
        promiseFind.push(FindPromotionById_ID(promotion_id));
      }
      const [userExists, postExists, car_Rent_StatusExists, promotionExists] =
        await Promise.all(promiseFind);
      if (
        !userExists ||
        !postExists ||
        !car_Rent_StatusExists ||
        (promotion_id && !promotionExists)
      ) {
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: `${
            !userExists
              ? "user"
              : !postExists
              ? "post"
              : !car_Rent_StatusExists
              ? "car_rent_status"
              : "promotion"
          }`,
        });
      }
      const [
        car_rent_doc_image_url,
        car_rent_payment_image_url,
        car_rent_driving_lincense_image_url,
      ] = await Promise.all([
        uploadImages(data.car_rent_doc_image),
        uploadImages(data.car_rent_payment_image),
        uploadImages(data.car_rent_driving_lincense_image),
      ]);
      const car_rent = await prisma.car_rent.create({
        data: {
          user_id,
          post_id,
          type_rent,
          price_rent,
          start_date,
          end_date,
          frist_name,
          last_name,
          village,
          district,
          province,
          phone_number,
          email,
          doc_type,
          discount,
          total_price,
          booking_fee,
          tax,
          pay_destination,
          khampakan,
          pay_type,
          description,
          status_id,
          scope,
        },
      });
      const car_rent_doc_image_data = AddCar_rent_id_url(
        car_rent_doc_image_url,
        car_rent.id
      );
      const car_rent_payment_image_data = AddCar_rent_id_url(
        car_rent_payment_image_url,
        car_rent.id
      );
      const car_rent_driving_lincense_image_data = AddCar_rent_id_url(
        car_rent_driving_lincense_image_url,
        car_rent.id
      );
      const promiseAdd = [
        Car_rent_doc_image.insert(car_rent_doc_image_data),
        Car_rent_payment_image.insert(car_rent_payment_image_data),
        Car_rent_driving_lincense_image.insert(
          car_rent_driving_lincense_image_data
        ),
      ];

      if (car_rent_visa) {
        promiseAdd.push(
          Car_rent_visa.insertOne({
            car_rent_id: car_rent.id,
            name: car_rent_visa.name,
            exp_date: car_rent_visa.exp_date,
            cvv: car_rent_visa.cvv,
          })
        );
      }
      await Promise.all(promiseAdd);

      await ResCachedDataCar_rent({
        key,
        post_key: post_id,
        user_key: user_id,
        pay_status: car_rent.pay_status,
        user_post_key: user_id + "post",
      });
      const dt = await FindCar_rentById(car_rent.id);
      console.log("car_rent :>> ", dt);
      return SendSuccess({
        res,
        message: `${EMessage.insertSuccess} car_rent`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} car_rent`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      if (data.price_rent && typeof data.price_rent !== "number")
        data.price_rent = parseFloat(data.price_rent);
      if (data.discount && typeof data.discount !== "number")
        data.discount = parseFloat(data.discount);
      if (data.total_price && typeof data.total_price !== "number")
        data.total_price = parseFloat(data.total_price);
      if (data.tax && typeof data.tax !== "number")
        data.tax = parseFloat(data.tax);
      if (data.khampakan && typeof data.khampakan !== "number")
        data.khampakan = parseFloat(data.khampakan);

      if (data.pay_status || typeof data.pay_status !== "boolean")
        data.pay_status = data.pay_status === "true";

      if (data.booking_fee && typeof data.booking_fee !== "number")
        data.booking_fee = parseFloat(data.booking_fee);
      if (data.pay_destination && typeof data.pay_destination !== "number")
        data.pay_destination = parseFloat(data.pay_destination);

      let promiseList = [FindCar_rentById_for_edit(id)];
      if (data.user_id) promiseList.push(FindUserById_ID(data.user_id));

      if (data.post_id) promiseList.push(FindPostById_for_edit(data.post_id));
      if (data.promotion_id)
        promiseList.push(FindPromotionById_ID(data.promotion_id));
      if (data.status_id)
        promiseList.push(FindCar_Rent_StatusById(data.status_id));
      const result = await Promise.all(promiseList);

      let car_rentExists,
        userExists,
        postExists,
        promotionExists,
        car_rent_StatusExists;

      car_rentExists = result.shift();
      if (data.user_id) userExists = result.shift();
      if (data.post_id) postExists = result.shift();
      if (data.promotion_id) promotionExists = result.shift();
      if (data.status_id) car_rent_StatusExists = result.shift();

      if (
        !car_rentExists ||
        (data.user_id && !userExists) ||
        (data.post_id && !postExists) ||
        (data.promotion_id && !promotionExists) ||
        (data.status_id && !car_rent_StatusExists)
      )
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: `${
            !car_rentExists
              ? "car_rent"
              : data.user_id && !userExists
              ? "user"
              : data.post_id && !postExists
              ? "post"
              : data.promotion_id && !promotionExists
              ? "promotion"
              : "car_rent_status"
          } id`,
        });

      const car_rent = await prisma.car_rent.update({
        where: {
          id,
        },
        data,
      });
      await Promise.all([
        await ResCachedDataCar_rent({
          id,
          key,
          post_key: car_rentExists.post_id,
          user_key: car_rentExists.user_id,
          pay_status: car_rentExists.pay_status,
          user_post_key: car_rentExists.user_id + "post",
        }),
        await ResCachedDataCar_rent({
          id,
          key,
          post_key: car_rent.post_id,
          user_key: car_rent.user_id,
          pay_status: car_rent.pay_status,
          user_post_key: car_rent.user_id + "post",
        }),
      ]);

      const dt = await FindCar_rentById(id);
      console.log("dt :>> ", dt);
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} `,
        err,
      });
    }
  },

  async UpdateStatus(req, res) {
    try {
      const id = req.params.id;
      const validate = ValidateCar_rent_update_status(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });

      const { user_id, status_id } = req.body;

      const [car_rentExists, userExists, statusExists] = await Promise.all([
        FindCar_rentById_for_edit(id),
        FindUserById_ID(user_id),
        FindCar_Rent_StatusById(status_id),
      ]);
      if (!car_rentExists || !statusExists || !userExists)
        return SendError({
          res,
          message: `${EMessage.notFound}`,
          err: `${
            !car_rentExists
              ? "car_rent_id"
              : !statusExists
              ? "status_id"
              : "user_id"
          }`,
        });
      if (userExists.role === "customer") {
        return SendError({
          res,
          message: `Not an admin account`,
          err: "Not an admin account",
        });
      }

      const car_rent = await prisma.car_rent.update({
        where: {
          id,
        },
        data: {
          status_id,
          admin_id: user_id,
        },
      });

      await Promise.all([
        await ResCachedDataCar_rent({
          id,
          key,
          post_key: car_rentExists.post_id,
          user_key: car_rentExists.user_id,
          pay_status: car_rentExists.pay_status,
          user_post_key: car_rentExists.user_id + "post",
        }),
        await ResCachedDataCar_rent({
          id,
          key,
          post_key: car_rent.post_id,
          user_key: car_rent.user_id,
          pay_status: car_rent.pay_status,
          user_post_key: car_rent.user_id + "post",
        }),
      ]);
      const dt = await FindCar_rentById(id);
      console.log("dt :>> ", dt);
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} `,
        err,
      });
    }
  },
  async UpdatePayment_status(req, res) {
    try {
      const id = req.params.id;
      let { pay_status } = req.body;
      if (!pay_status)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.pleaseInput}`,
          err: `pay_status`,
        });
      if (typeof pay_status !== "boolean") pay_status = pay_status === "true";
      const car_rentExists = await FindCar_rentById_for_edit(id);
      if (!car_rentExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: `car_rent id`,
        });

      const car_rent = await prisma.car_rent.update({
        where: {
          id,
        },
        data: { pay_status, status_id: car_rent_status_user_approval },
      });
      await Promise.all([
        await ResCachedDataCar_rent({
          id,
          key,
          post_key: car_rentExists.post_id,
          user_key: car_rentExists.user_id,
          pay_status: car_rentExists.pay_status,
          user_post_key: car_rentExists.user_id + "post",
        }),
        await ResCachedDataCar_rent({
          id,
          key,
          post_key: car_rent.post_id,
          user_key: car_rent.user_id,
          pay_status: car_rent.pay_status,
          user_post_key: car_rent.user_id + "post",
        }),
      ]);
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed}car_rent pay_status`,
        err,
      });
    }
  },
  async UpdateCar_rent_visa(req, res) {
    try {
      const id = req.params.id;
      let { car_rent_visa } = req.body;
      if (!car_rent_visa)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: `car_rent_visa type object {id:number,name,exp_date:DateTime,cvv}`,
        });
      if (typeof car_rent_visa === "string") {
        car_rent_visa = JSON.parse(car_rent_visa);
        if (
          !car_rent_visa.id ||
          !car_rent_visa.name ||
          !car_rent_visa.exp_date ||
          !car_rent_visa.cvv
        ) {
          return SendError({
            res,
            statuscode: 400,
            message: `${EMessage.pleaseInput}`,
            err: "car_rent_visa type object {id:number,name,exp_date:DateTime,cvv}",
          });
        }
      }
      const [car_rentExists, car_rent_visaExists] = await Promise.all([
        FindCar_rentById_for_edit(id),
        Car_rent_visa.findUnique({ id: car_rent_visa.id }),
      ]);

      if (!car_rentExists || !car_rent_visaExists)
        return SendError({
          res,
          message: `${EMessage.notFound}`,
          err: `${!car_rentExists ? "car_rent" : "car_rent_visa"} id`,
        });
      const car_rent_visas = await Car_rent_visa.update(
        car_rent_visa.id,
        car_rent_visa
      );
      await ResCachedDataCar_rent({
        id,
        key,
        post_key: car_rentExists.post_id,
        user_key: car_rentExists.user_id,
        pay_status: car_rentExists.pay_status,
        user_post_key: car_rentExists.user_id + "post",
      });
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: car_rent_visas,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed}car_rent car_rent_visa `,
        err,
      });
    }
  },
  async UpdateDoc_image(req, res) {
    return UpdateCar_rentImage(
      req,
      res,
      "car_rent_doc_image",
      Car_rent_doc_image.findUnique,
      Car_rent_doc_image.update
    );
  },
  async UpdatePayment_image(req, res) {
    return UpdateCar_rentImage(
      req,
      res,
      "car_rent_payment_image",
      Car_rent_payment_image.findUnique,
      Car_rent_payment_image.update
    );
  },
  async UpdateCar_rent_driving_lincense_image(req, res) {
    return UpdateCar_rentImage(
      req,
      res,
      "car_rent_driving_lincense_image",
      Car_rent_driving_lincense_image.findUnique,
      Car_rent_driving_lincense_image.update
    );
  },
  async Delete(req, res) {
    try {
      const id = req.params.id;
      const car_rentExists = await FindCar_rentById_for_edit(id);
      if (!car_rentExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: `car_rent id`,
        });

      const car_rent = await prisma.car_rent.update({
        where: {
          id,
        },
        data: { is_active: false },
      });

      await ResCachedDataCar_rent({
        id,
        key,
        post_key: car_rentExists.post_id,
        user_key: car_rentExists.user_id,
        pay_status: car_rentExists.pay_status,
        user_post_key: car_rentExists.user_id + "post",
      });
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} `,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const car_rent = await FindCar_rentById(id);
      if (!car_rent)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}`,
          err: "car_rent id",
        });
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess}`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne} `,
        err,
      });
    }
  },
  async SelectAllPage(req, res) {
    try {
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const car_rent = await CachDataLimit(
        key + "-" + page,
        model,
        {
          is_active: true,
        },
        page,
        select,
        {
          updated_at: "desc",
        }
      );
      CachDataLimit(
        key + "-" + (page + 1),
        model,
        {
          is_active: true,
        },
        page + 1,
        select,
        {
          updated_at: "desc",
        }
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess} user`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} car_rent all page `,
        err,
      });
    }
  },
  async SelectAllPagePay_status(req, res) {
    try {
      // await DeleteCachedKey(key);
      let page = parseInt(req.query.page);
      let { pay_status } = req.query;
      if (!pay_status) {
        return SendError({
          res,
          message: `${EMessage.pleaseInput}`,
          err: "pay_status",
        });
      }
      if (typeof pay_status !== "boolean") pay_status = pay_status === "true";
      page = !page || page < 0 ? 0 : page - 1;
      const car_rent = await CachDataLimit(
        `${pay_status}` + key + "-" + page,
        model,
        {
          pay_status,
          is_active: true,
        },
        page,
        select,
        {
          updated_at: "desc",
        }
      );
      CachDataLimit(
        `${pay_status}` + key + "-" + (page + 1),
        model,
        {
          pay_status,
          is_active: true,
        },
        page + 1,
        select,
        {
          updated_at: "desc",
        }
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess} user`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll} car_rent all page `,
        err,
      });
    }
  },
  // async SelectAllPageByUser_id(req, res) {
  //   try {
  //     // await DeleteCachedKey(key);
  //     let page = parseInt(req.query.page);
  //     const id = req.params.id;
  //     page = !page || page < 0 ? 0 : page - 1;
  //     const car_rent = await CachDataLimit(
  //       id + key + "-" + page,
  //       model,
  //       {
  //         user_id: id,
  //         // pay_status: true,
  //         is_active: true,
  //       },
  //       page,
  //       select
  //     );
  //     CachDataLimit(
  //       id + key + "-" + (page + 1),
  //       model,
  //       {
  //         user_id: id,
  //         // pay_status: true,
  //         is_active: true,
  //       },
  //       page + 1,
  //       select
  //     );
  //     return SendSuccess({
  //       res,
  //       message: `${EMessage.fetchOneSuccess} user`,
  //       data: car_rent,
  //     });
  //   } catch (err) {
  //     return SendErrorLog({
  //       res,
  //       message: `${EMessage.serverError} ${EMessage.errorFetchingAll} car_rent by user_id `,
  //       err,
  //     });
  //   }
  // },
  async SelectAllPageByPost_id(req, res) {
    try {
      // await DeleteCachedKey(key);
      let page = parseInt(req.query.page);
      const id = req.params.id;
      page = !page || page < 0 ? 0 : page - 1;
      const car_rent = await CachDataLimit(
        id + key + "-" + page,
        model,
        {
          post_id: id,
          pay_status: true,
          is_active: true,
        },
        page,
        select,
        {
          updated_at: "desc",
        }
      );
      CachDataLimit(
        id + key + "-" + (page + 1),
        model,
        {
          post_id: true,
          pay_status: true,
          is_active: true,
        },
        page + 1,
        select,
        {
          updated_at: "desc",
        }
      );
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess} user`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll}car_rent by post id `,
        err,
      });
    }
  },
  async SelectAllByUser_id(req, res) {
    try {
      // await DeleteCachedKey(key);

      const user_id = req.user;

      const car_rent = await CachDataAll(
        user_id + key,
        model,
        {
          user_id,
          is_active: true,
          status_id: {
            notIn: [car_rent_status_Success, car_rent_status_Failure],
          },
        },
        select,
        {
          updated_at: "desc",
        }
      );

      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess} user`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll}car_rent by user id and status id `,
        err,
      });
    }
  },
  async SelectAllByUser_idHistory(req, res) {
    try {
      // await DeleteCachedKey(key);
      const user_id = req.user;
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;

      const car_rent = await Promise.all([
        CachDataLimit(
          user_id + key + "h" + page,
          model,
          {
            user_id,
            is_active: true,
            status_id: {
              in: [car_rent_status_Success, car_rent_status_Failure],
            },
          },
          page,
          select,
          {
            updated_at: "desc",
          }
        ),
        CachDataLimit(
          user_id + key + "h" + (page + 1),
          model,
          {
            user_id,
            is_active: true,
            status_id: {
              in: [car_rent_status_Success, car_rent_status_Failure],
            },
          },
          page + 1,
          select,
          {
            updated_at: "desc",
          }
        ),
      ]);

      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess} user`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll}car_rent by user id and status id `,
        err,
      });
    }
  },

  async SelectByUserPost(req, res) {
    try {
      const user_id = req.user;

      const car_rent = await CachDataAll(
        user_id + "post" + key,
        "car_rent",
        {
          is_active: true,
          pay_status: true,
          post: {
            user_id,
          },

          status_id: {
            notIn: [
              car_rent_status,
              car_rent_status_Success,
              car_rent_status_Failure,
            ],
          },
        },
        undefined,
        {
          updated_at: "desc",
        }
      );

      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess} user`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll}car_rent by user id post`,
        err,
      });
    }
  },
  async SelectByUserPostHistory(req, res) {
    try {
      const user_id = req.user;
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;

      const [car_rent] = await Promise.all([
        CachDataLimit(
          user_id + "post" + key + "h" + page,
          "car_rent",
          {
            is_active: true,
            pay_status: true,
            post: {
              user_id,
            },
            status_id: {
              in: [car_rent_status_Success, car_rent_status_Failure],
            },
          },
          page,
          select,
          {
            updated_at: "desc",
          }
        ),
        CachDataLimit(
          user_id + "post" + key + "h" + (page + 1),
          "car_rent",
          {
            is_active: true,
            pay_status: true,
            post: {
              user_id,
            },
            status_id: {
              in: [car_rent_status_Success, car_rent_status_Failure],
            },
          },
          page + 1,
          select,
          {
            updated_at: "desc",
          }
        ),
      ]);

      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess} user`,
        data: car_rent,
      });
    } catch (err) {
      return SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll}car_rent by user id post`,
        err,
      });
    }
  },
};
export default Car_rentController;

const UpdateCar_rentImage = async (
  req,
  res,
  imageType,
  findImageById,
  updateImage
) => {
  try {
    const id = req.params.id;
    let { image_data_update } = req.body;
    console.log("image_data_update :>> ", image_data_update);

    if (!image_data_update) {
      return SendError(res, 400, `${EMessage.pleaseInput}: image_data_update`);
    }

    if (typeof image_data_update === "string") {
      image_data_update = JSON.parse(image_data_update);
    }

    if (
      !image_data_update.id ||
      !image_data_update.url ||
      !image_data_update.car_rent_id
    ) {
      return SendError({
        res,
        statuscode: 400,
        message: `${EMessage.pleaseInput}`,
        err: ` ${imageType} type object {id,car_rent_id,url}`,
      });
    }

    const data = req.files;

    if (!data || !data[imageType]) {
      return SendError({
        res,
        statuscode: 400,
        message: `${EMessage.pleaseInput}`,
        err: ` ${imageType}`,
      });
    }

    const [car_rentExists, imageExists] = await Promise.all([
      FindCar_rentById_for_edit(id),
      findImageById({ id: image_data_update.id }),
    ]);

    if (!car_rentExists || !imageExists) {
      return SendError({
        res,
        statuscode: 404,
        message: `${EMessage.notFound}`,
        err: ` ${!car_rentExists ? "car_rent" : imageType} id`,
      });
    }
    if (id !== imageExists.car_rent_id)
      return SendError({
        res,
        statuscode: 400,
        message: `you not own car_rent`,
        err: `you not own car_rent`,
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
    await ResCachedDataCar_rent({
      id,
      key,
      post_key: car_rentExists.post_id,
      user_key: car_rentExists.user_id,
      pay_status: car_rentExists.pay_status,
      user_post_key: car_rentExists.user_id + "post",
    });
    return SendSuccess({
      res,
      message: `${EMessage.updateSuccess} update ${imageType}`,
      data: imageUpdate,
    });
  } catch (err) {
    return SendErrorLog({
      res,
      message: `${EMessage.serverError} ${EMessage.updateFailed} car_rent ${imageType}`,
      err,
    });
  }
};
