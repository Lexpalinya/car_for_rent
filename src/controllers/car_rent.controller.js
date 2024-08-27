import { EMessage } from "../services/enum";
import {
  FindCar_Rent_StatusById,
  FindPost_StatusById,
  FindPostById,
  FindPostById_for_edit,
  FindUserById_ID,
} from "../services/find";
import { SendError, SendErrorLog } from "../services/services";
import { ValidateCar_rent } from "../services/validate";

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
        booking_fee,
        pay_destination,
        pay_type,
        bank_no,
        pay_status,
        status_id,

        //------
        description,
        reason,
        promotion_id,
        car_rent_visa,
      } = req.body;

      let promiseFind = [
        FindUserById_ID(user_id),
        FindPostById_for_edit(post_id),
        FindCar_Rent_StatusById(status_id),
      ];
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
