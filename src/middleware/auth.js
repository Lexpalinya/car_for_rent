import { EMessage } from "../services/enum";
import { FindUserById_ID } from "../services/find";
import { SendError, verify_token } from "../services/services";

export const auth = async (req, res, next) => {
  try {
    const authorization = req.headers["authorization"];
    if (!authorization)
      return SendError({
        res,
        status: 401,
        message: `${EMessage.invalidToken}`,
      });
    const token = authorization.replace("Bearer ", "").trim();
    if (!token)
      return SendError({
        res,
        status: 401,
        message: EMessage.notFound + " Token",
      });
    const decode = await verify_token(token);
    req.user = decode;

    next();
  } catch (err) {
    if (err.message == "Token has expired") {
      return SendError({ res, status: 401, message: EMessage.tokenExpired });
    }
    return SendError({
      res,
      status: 401,
      message: err.message || "Unauthorized",
    });
  }
};

export const admin = async (req, res, next) => {
  try {
    const id = req.user;

    if (!id)
      return SendError({ res, status: 401, message: "You are not allowed id" });
    const user = await FindUserById_ID(id);
    console.log("user.role :>> ", user.role);
    if (user.role == "admin" || user.role == "superadmin") {
      return next();
    }
    return SendError({ res, status: 401, message: "You are not allowed " });
  } catch (err) {
    return SendError({
      res,
      status: 401,
      message: EMessage.serverError,
      err: err.message,
    });
  }
};
