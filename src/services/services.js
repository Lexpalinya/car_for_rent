import CryptoJS from "crypto-js";
import { JWT_SECRET_KEY, SECRET_KEY } from "../config/api.config";
import Jwt from "jsonwebtoken";
import { generateToken } from "../config/generate.token";
import prisma from "../utils/prisma.client";
import { FindUserById_ID } from "./find";

export const SendSuccess = (res, message, data) => {
  return res.status(200).json({
    status: true,
    message: message || "Operation Successful",
    data,
  });
};
export const SendCreate = (res, message, data) => {
  return res.status(201).json({
    status: true,
    message: message || "Operation Successful",
    data,
  });
};
export const SendError = (res, statuscode = 400, message, err) => {
  return res.status(statuscode).json({
    status: false,
    message: message || "Operation failed",
    err,
  });
};
export const SendErrorLog = (res, message, err) => {
  console.error(`Erro ${message}:${err}`);
  return res.status(500).json({
    status: false,
    message: message || "Operation Error Iternal Server",
    err,
  });
};
export const Encrypt = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const Decrypt = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await CryptoJS.AES.decrypt(data, SECRET_KEY).toString(
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
    Jwt.verify(token, JWT_SECRET_KEY, async (err, decode) => {
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
        const user = await FindUserById_ID(decode.id);
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
    Jwt.verify(token, JWT_SECRET_KEY, async (err, decode) => {
      if (err) {
        if (err.message === "TokenExpiredError") {
          console.error(
            "JWT verification error:Refresh Token has expired",
            err
          );
          return reject(new Error("Refresh Token has expired"));
        } else {
          console.error("Jwt verification error:" + err);
          return reject(new Error("Invalid Refresh Token"));
        }
      }
      try {
        const id = await Decrypt(decode.id);
        if (!id) {
          return reject("Error Invalid Refresh Token");
        }
        const userExists = await FindUserById_ID(id);
        if (!userExists)
          return reject("Invalid valid authentication:user not found");
        const user = await prisma.users.update({
          where: { id },
          data: {
            login_version: userExists.login_version + 1,
          },
        });
        const data_token = {
          id,
          loginversion: user.login_version,
        };
        const token = await generateToken(data_token);
        resolve(token);
      } catch (error) {
        console.error("Error generated Refresh Token: " + error);
        return reject(new Error("Error generated Refresh Token"));
      }
    });
  });
};

export const AddPost_id_url = (arr, id) => {
  return arr.map((url) => ({
    post_id: id,
    url,
  }));
};
export const AddCar_rent_id_url = (arr, id) => {
  return arr.map((url) => ({
    car_rent_id: id,
    url,
  }));
};

export const EnsureArray = (arr) => {
  return Array.isArray(arr) ? arr : [arr];
};
