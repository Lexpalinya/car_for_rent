import jwt from "jsonwebtoken";
import {
  JWT_REFRECH_TIMEOUT,
  JWT_SECRET_KEY,
  JWT_SECRET_KEY_REFRESH,
  JWT_TIMEOUT,
  SECRET_KEY,
} from "./api.config";

export const generateToken = async (data) => {
  try {
    const payload = {
      id: data.id,
      loginversion: data.loginversion,
    };

    // Encrypt the user ID
    const encrypt_id = payload.id;

    // JWT options for access and refresh tokens
    const jwtOptions = { expiresIn: String(JWT_TIMEOUT) };
    const jwtRefreshOptions = { expiresIn: String(JWT_REFRECH_TIMEOUT) };

    // Create payloads for the tokens
    const refreshPayload = {
      id: encrypt_id,
      loginversion: data.loginversion,
    };

    // Generate the access token
    const token = jwt.sign(payload, JWT_SECRET_KEY, jwtOptions);

    // Generate the refresh token
    const refreshToken = jwt.sign(
      refreshPayload,
      JWT_SECRET_KEY_REFRESH,
      jwtRefreshOptions
    );

    // Verify the generated access token (optional)
    // jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
    //   if (err) {
    //     console.error("Token verification error:", err);
    //   } else {
    //     console.log("Verified token payload:", decoded);
    //   }
    // });
    const expired = jwt.verify(token, JWT_SECRET_KEY);

    // Return the tokens
    return {
      token,
      refresh_token: refreshToken,
      token_expires: expired.exp,
    };
  } catch (err) {
    console.error("Error generating token:", err);
    return false;
  }
};
