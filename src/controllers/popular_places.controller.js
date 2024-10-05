import { empty } from "@prisma/client/runtime/library";
import { EMessage } from "../services/enum";
import { SendError, SendErrorLog } from "../services/services";
import { ValidatePopular_Places } from "../services/validate";

const Popular_PlacesController = {
  async Insert(req, res) {
    try {
      const data = req.files;
      if (!data || !data.coverImage || !data.images) {
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: `${
            !data ? "coverImage" : !data.coverImage ? "coverImage" : "images"
          }`,
        });
      }
      const validate = ValidatePopular_Places(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { street, point, village, district, province, details } = req.body;
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} bannner`,
        err,
      });
    }
  },
};
export default Popular_PlacesController;
