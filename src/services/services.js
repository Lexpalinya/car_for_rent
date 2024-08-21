import CryptoJS from "crypto-js";
import { SECRET_KEY } from "../config/api.config";
import jwt from "jsonwebtoken";
import { generateToken } from "../config/generate.token";

export const SendSuccess = (res, message, data) => {
  return res.status(200).Json({
    res,
    status: true,
    message: message || "Operation Successful",
    data,
  });
};
export const SendCreate = (res, message, data) => {
  return res.status(201).Json({
    res,
    status: true,
    message: message || "Operation Successful",
    data,
  });
};
export const SendError = (res, statuscode = 400, message, err) => {
  return res.status(statuscode).Json({
    res,
    status: true,
    message: message || "Operation Successful",
    err,
  });
};
export const SendErrorLog = (res, message, err) => {
  console.error(`Erro ${message}:${err}`);
  return res.status(500).Json({
    res,
    status: false,
    message: message || "Operation Successful",
    data,
  });
};
export const Encrypt = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await CryptoJS.encrypt(data, SECRET_KEY).toString();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const Decrypt = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await CryptoJS.decrypt(data, SECRET_KEY).toString(
        CryptoJS.enc.Utf8
      );
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const verify_token = (token) => {
  return new Promise(async (resolve, reject) => {
    jwt.verify(token, SECRET_KEY, async (err, decode) => {
      if (err) {
        if (err.message === "TokenExpiredError") {
          console.error("JWT verification error: Token has expired");
          return reject(new Error("Token has expired"));
        } else {
          console.error("JWT verification error:" + err.message);
          return reject(new Error("Invalid token"));
        }
      }
      try {
        // const id = await Decrypt(decode.id);
        const user = await Find_user_by_id_id(decode.id);
        if (!user)
          return reject(
            new Error("Invalid valid authentication:user not found")
          );
        return resolve(user.id);
      } catch (err) {
        console.log("Decryted or Database error", err);
        return reject(new Error("Error decryted token or fetching user data"));
      }
    });
  });
};
export const verify_refresh_token = (token) => {
  return new Promise(async (resolve, reject) => {
    jwt.verify(token, SECRET_KEY, async (err, decode) => {
      if (err) {
        if (err.message === "TokenExpiredError") {
          console.error("JWT verification error:Token has expired");
          return reject(new Error("Token has expired"));
        } else {
          console.error("Jwt verification error:" + err.message);
          return reject(new Error("Invalid token"));
        }
      }
      try {
        const id = await Decrypt(decode.id);
        if (!id) {
          return reject("Error Invalid refresh token");
        }
        const userExists = await Find_user_by_id_id_login_version(id);
        if (!userExists)
          return reject("Invalid valid authentication:user not found");
        const user = await updateUser(id, {
          login_version: userExists.login_version + 1,
        });
        const data_token = {
          id,
          loginversion: data.loginversion,
        };
        const token = await generateToken(data_token);
        resolve(token);
      } catch (error) {
        console.error("Error generated token: " + error);
        return reject(new Error("Error generated token generated"));
      }
    });
  });
};
