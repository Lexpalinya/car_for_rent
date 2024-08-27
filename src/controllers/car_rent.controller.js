import { EMessage } from "../services/enum";
import { SendError, SendErrorLog } from "../services/services";

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
        description,
        promotion_id,
        booking_fee,
        pay_destination,
        pay_type,
        bank_no,
        pay_status,
        reason,
        status_id,
      } = req.body;

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
