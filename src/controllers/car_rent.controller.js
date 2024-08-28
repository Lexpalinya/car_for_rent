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
  Car_rent_payment_image,
  Car_rent_visa,
} from "../services/subtabel";
import { UploadImage, uploadImages } from "../services/upload.file";
import { DataExists, ValidateCar_rent } from "../services/validate";
import prisma from "../utils/prisma.client";
let key = "car_rent";
let model = "car_rent";
let select = {
  id: true,
  post_id: true,
  user_id: true,
  start_date: true,
  end_date: true,
  frist_name: true,
  last_name: true,
  email: true,
  phone_number: true,
  doc_type: true,
  booking_fee: true,
  pay_destination: true,
  description: true,
  reason: true,
  promotion_id: true,
  post: {
    select: {
      star: true,
      car_brands: {
        select: {
          name: true,
        },
      },
      car_version: true,
      car_year: true,
      post_car_image: {
        select: {
          url: true,
        },
      },
    },
  },
};
const Car_rentController = {
  async Insert(req, res) {
    try {
      const validate = ValidateCar_rent(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      let {
        user_id,
        post_id,
        start_date,
        end_date,
        frist_name,
        last_name,
        email,
        phone_number,
        doc_type,
        booking_fee, //number
        pay_destination, //number
        pay_type,
        bank_no,
        status_id,

        //------
        description,
        reason,
        promotion_id,
        //-------------
        car_rent_visa,
      } = req.body;
      if (typeof booking_fee !== "number")
        booking_fee = parseFloat(booking_fee);
      if (typeof pay_destination !== "number")
        pay_destination = parseFloat(pay_destination);

      const data = req.files;
      if (!data || !data.car_rent_doc_image || !data.car_rent_payment_image) {
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${
            !data
              ? "car_rent_doc_image,car_rent_payment_image"
              : !data.car_rent_doc_image
              ? "car_rent_doc_image"
              : "car_rent_payment_image"
          }`
        );
      }

      if (car_rent_visa && typeof car_rent_visa === "string") {
        console.log("car_rent_visa :>> ", car_rent_visa);
        car_rent_visa = JSON.parse(car_rent_visa);
        if (
          !car_rent_visa.name ||
          !car_rent_visa.exp_date ||
          !car_rent_visa.cvv
        ) {
          return SendError(
            res,
            400,
            `${EMessage.pleaseInput} car_rent_visa type object {name,exp_date:DateTime,cvv}`
          );
        }
      }

      data.car_rent_doc_image = EnsureArray(data.car_rent_doc_image);
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
        return SendError(
          res,
          404,
          `${EMessage.notFound}:${
            !userExists
              ? "user"
              : !postExists
              ? "post"
              : !car_Rent_StatusExists
              ? "car_Rent_status"
              : "promotion"
          }`
        );
      }
      const [car_rent_doc_image_url, car_rent_payment_image_url] =
        await Promise.all([
          uploadImages(data.car_rent_doc_image),
          uploadImages(data.car_rent_payment_image),
        ]);
      const car_rent = await prisma.car_rent.create({
        data: {
          user_id,
          post_id,
          start_date,
          end_date,
          frist_name,
          last_name,
          email,
          phone_number,
          doc_type,
          booking_fee,
          pay_destination,
          pay_type,
          bank_no,
          status_id,
          description,
          reason,
          promotion_id,
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
      const promiseAdd = [
        Car_rent_doc_image.insert(car_rent_doc_image_data),
        Car_rent_payment_image.insert(car_rent_payment_image_data),
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
      return SendSuccess(res, `${EMessage.insertSuccess} car_rent`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} `,
        error
      );
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);

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
        return SendError(
          res,
          404,
          `${EMessage.notFound}: ${
            !car_rentExists
              ? "car_rent"
              : data.user_id && !userExists
              ? "user"
              : data.post_id && !postExists
              ? "post"
              : data.promotion_id && !promotionExists
              ? "promotion"
              : "car_rent_status"
          }`
        );

      const car_rent = await prisma.car_rent.update({
        where: {
          id,
        },
        data,
      });
      return SendSuccess(res, `${EMessage.deleteSuccess}`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed} `,
        error
      );
    }
  },
  async UpdatePayment_status(req, res) {
    try {
      const id = req.params.id;
      let { pay_status } = req.body;
      if (!pay_status)
        return SendSuccess(res, `${EMessage.pleaseInput}:pay_status`);
      if (typeof pay_status !== "boolean") pay_status = pay_status === "true";
      const car_rentExists = await FindCar_rentById_for_edit(id);
      if (!car_rentExists)
        return SendError(res, `${EMessage.notFound}: car_rent id`);

      const car_rent = await prisma.car_rent.update({
        where: {
          id,
        },
        data: { pay_status },
      });
      return SendSuccess(res, `${EMessage.deleteSuccess}`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed}car_rent pay_status`,
        error
      );
    }
  },
  async UpdateCar_rent_visa(req, res) {
    try {
      const id = req.params.id;
      let { car_rent_visa } = req.body;
      if (!car_rent_visa)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput} car_rent_visa type object {id:number,name,exp_date:DateTime,cvv}`
        );
      if (typeof car_rent_visa === "string") {
        // console.log("object :>> ", object);
        car_rent_visa = JSON.parse(car_rent_visa);
        if (
          !car_rent_visa.id ||
          !car_rent_visa.name ||
          !car_rent_visa.exp_date ||
          !car_rent_visa.cvv
        ) {
          return SendError(
            res,
            400,
            `${EMessage.pleaseInput} car_rent_visa type object {id:number,name,exp_date:DateTime,cvv}`
          );
        }
      }
      const [car_rentExists, car_rent_visaExists] = await Promise.all([
        FindCar_rentById_for_edit(id),
        Car_rent_visa.findUnique({ id: car_rent_visa.id }),
      ]);

      if (!car_rentExists || !car_rent_visaExists)
        return SendError(
          res,
          `${EMessage.notFound}:${
            !car_rentExists ? "car_rent" : "car_rent_visa"
          } id`
        );
      const car_rent_visas = await Car_rent_visa.update(
        car_rent_visa.id,
        car_rent_visa
      );
      return SendSuccess(res, `${EMessage.updateSuccess}`, car_rent_visas);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed}car_rent car_rent_visa `,
        error
      );
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

  async Delete(req, res) {
    try {
      const id = req.params.id;
      const car_rentExists = await FindCar_rentById_for_edit(id);
      if (!car_rentExists)
        return SendError(res, `${EMessage.notFound}: car_rent id`);

      const car_rent = await prisma.car_rent.update({
        where: {
          id,
        },
        data: { is_active: false },
      });
      return SendSuccess(res, `${EMessage.deleteSuccess}`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed} `,
        error
      );
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const car_rent = await FindCar_rentById(id);
      if (!car_rent)
        return SendError(res, 404, `${EMessage.notFound}: car_rent id`);
      return SendSuccess(res, `${EMessage.fetchOneSuccess}`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne} `,
        error
      );
    }
  },
  async SelectAllPage(req, res) {
    try {
      // await DeleteCachedKey(key);

      let select1 = {
        id: true,
        post_id: true,
        user_id: true,
        start_date: true,
        end_date: true,
        frist_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        doc_type: true,
        booking_fee: true,
        pay_destination: true,
        description: true,
        reason: true,
        promotion_id: true,
        post: {
          select: {
            star: true,
            car_brands: {
              select: {
                name: true,
              },
            },
            car_version: true,
            car_year: true,
            post_car_image: {
              select: {
                url: true,
              },
            },
          },
        },
        car_rent_doc_image: true,
        car_rent_payment_image: true,
        car_rent_visa: true,
      };

      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const car_rent = await CachDataLimit(
        key + "-" + page,
        model,
        {
          is_active: true,
        },
        page,
        select1
      );
      CachDataLimit(
        key + "-" + (page + 1),
        model,
        {
          is_active: true,
        },
        page + 1,
        select1
      );
      return SendSuccess(res, `${EMessage.fetchOneSuccess} user`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll} car_rent all page `,
        error
      );
    }
  },
  async SelectAllPagePay_status(req, res) {
    try {
      // await DeleteCachedKey(key);
      let page = parseInt(req.query.page);
      let { pay_status } = req.query;
      if (!pay_status) {
        return SendError(res, `${EMessage.pleaseInput}:pay_status`);
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
        select
      );
      CachDataLimit(
        `${pay_status}` + key + "-" + (page + 1),
        model,
        {
          pay_status,
          is_active: true,
        },
        page + 1,
        select
      );
      return SendSuccess(res, `${EMessage.fetchOneSuccess} user`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll} car_rent all page `,
        error
      );
    }
  },
  async SelectAllPageByUser_id(req, res) {
    try {
      // await DeleteCachedKey(key);
      let page = parseInt(req.query.page);
      const id = req.params.id;
      page = !page || page < 0 ? 0 : page - 1;
      const car_rent = await CachDataLimit(
        id + key + "-" + page,
        model,
        {
          user_id: id,
          // pay_status: true,
          is_active: true,
        },
        page,
        select
      );
      CachDataLimit(
        id + key + "-" + (page + 1),
        model,
        {
          user_id: id,
          // pay_status: true,
          is_active: true,
        },
        page + 1,
        select
      );
      return SendSuccess(res, `${EMessage.fetchOneSuccess} user`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll} car_rent by user_id `,
        error
      );
    }
  },
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
          post_id: true,
          pay_status: true,
          is_active: true,
        },
        page,
        select
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
        select
      );
      return SendSuccess(res, `${EMessage.fetchOneSuccess} user`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll}car_rent by post id `,
        error
      );
    }
  },
  async SelectAllPageByUser_idandStatus_id(req, res) {
    try {
      // await DeleteCachedKey(key);
      let page = parseInt(req.query.page);
      const { user_id } = req.body;

      CachDataAll(
        user_id + status_id + key + "-" + (page + 1),
        model,
        {
          user_id,

          // pay_status: true,
          is_active: true,
        },
        page + 1,
        select
      );
      return SendSuccess(res, `${EMessage.fetchOneSuccess} user`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingAll}car_rent by user id and status id `,
        error
      );
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
      return SendError(
        res,
        400,
        `${EMessage.pleaseInput}: ${imageType} type object {id,car_rent_id,url}`
      );
    }

    const data = req.files;

    if (!data || !data[imageType]) {
      return SendError(res, 400, `${EMessage.pleaseInput}: ${imageType}`);
    }

    const [car_rentExists, imageExists] = await Promise.all([
      FindCar_rentById_for_edit(id),
      findImageById({ id: image_data_update.id }),
    ]);

    if (!car_rentExists || !imageExists) {
      return SendError(
        res,
        404,
        `${EMessage.notFound}: ${!car_rentExists ? "car_rent" : imageType} id`
      );
    }

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

    return SendSuccess(
      res,
      `${EMessage.updateSuccess} update ${imageType}`,
      imageUpdate
    );
  } catch (error) {
    return SendErrorLog(
      res,
      `${EMessage.serverError} ${EMessage.updateFailed} car_rent ${imageType}`,
      error
    );
  }
};
