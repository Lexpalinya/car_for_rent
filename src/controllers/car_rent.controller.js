import { EMessage } from "../services/enum";
import {
  FindCar_Rent_StatusById,
  FindPost_StatusById,
  FindPostById,
  FindPostById_for_edit,
  FindPromotionById_ID,
  FindUserById_ID,
} from "../services/find";
import {
  EnsureArray,
  SendError,
  SendErrorLog,
  SendSuccess,
} from "../services/services";
import { UploadImage, uploadImages } from "../services/upload.file";
import { ValidateCar_rent } from "../services/validate";
import prisma from "../utils/prisma.client";

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

      data.car_rent_doc_image = EnsureArray(data.car_rent_doc_image);
      data.car_rent_payment_image = EnsureArray(data.car_rent_payment_image);
      let promiseFind = [
        FindUserById_ID(user_id),
        FindPostById_for_edit(post_id),
        FindCar_Rent_StatusById(status_id),
      ];
      if (!promotion_id) {
        promiseFind.push(FindPromotionById_ID(promotion_id));
      }
      const [userExists, postExists, car_Rent_StatusExists, promotionExists] =
        Promise.all(promiseFind);
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
      const promiseImage = await Promise.all([
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
      return SendSuccess(res, `${EMessage.insertSuccess} car_rent`, car_rent);
    } catch (error) {
      return SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} `,
        error
      );
    }
  },
};
export default Car_rentController;
