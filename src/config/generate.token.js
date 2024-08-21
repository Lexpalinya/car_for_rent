import Jwt from "jsonwebtoken";
import { JWT_REFRECH_TIMEOUT, JWT_SECRET_KEY, JWT_TIMEOUT } from "./api.config";
import { Encrypt } from "../services/services";

export const generateToken = async (data) => {
  try {
    const payload = {
      id: data.id,
      loginversion: data.loginversion,
    };
    const encrypt_id = await Encrypt(payload.id);
    const jwt_data = {
      expiresIn: String(JWT_TIMEOUT),
    };
    const jwt_refrech_data = {
      expiresIn: String(JWT_REFRECH_TIMEOUT),
    };
    const payload_refresh = {
      id: encrypt_id,
      loginversion: data.loginversion,
    };
    const token = jwt.sing(payload, JWT_SECRET_KEY, jwt_data);
    const refresh_token = jwt.sing(
      payload_refresh,
      JWT_SECRET_KEY,
      jwt_refrech_data
    );
    const result = {
      token,
      refresh_token,
    };
    return result;
  } catch (err) {
    console.log("Error generating token :=>", err);
    return false;
  }
};
