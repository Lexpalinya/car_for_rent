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
