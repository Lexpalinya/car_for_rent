import { password } from "bun";
import { generateToken } from "../config/generate.token";
import { EMessage } from "../services/enum";
import {
  Decrypt,
  Encrypt,
  SendCreate,
  SendError,
  SendErrorLog,
  SendSuccess,
  verify_refresh_token,
} from "../services/services";
import prisma from "../utils/prisma.client";
import { DataExists } from "../services/validate";
import { UploadImage } from "../services/upload.file";

const UserController = {
  async Registor(req, res) {
    try {
      const validate = ValidateUserRegistor(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const {
        username,
        email,
        password,
        phone_number,
        fackbook_id,
        google_id,
        device_token,
      } = req.body;

      const [
        usernameAlreadyExists,
        emailAlreadyExists,
        phone_numberAlreadyExists,
        hashpassword,
      ] = await Promise.all([
        FindUserUserNameAlready(username),
        FindUserEmailAlready(email),
        FindUserPhone_NumberAlready(phone_number),
        Encrypt(password),
      ]);
      if (
        usernameAlreadyExists ||
        emailAlreadyExists ||
        phone_numberAlreadyExists
      )
        return SendError(
          res,
          400,
          `${EMessage.userAlreadyExists}:with ${
            usernameAlreadyExists
              ? "username"
              : emailAlreadyExists
              ? "email"
              : "phone_numberAlreadyExists"
          }`
        );

      const user = await prisma.users.create({
        data: {
          username,
          email,
          password: hashpassword,
          phone_number,
          fackbook_id,
          google_id,
          device_token,
        },
      });
      const datatoken = {
        id: user.id,
        login_version: user.login_version,
      };
      const token = await generateToken(datatoken);
      const result = {
        ...user,
        token,
      };
      return SendCreate(res, `${EMessage.registrationSuccess} `, result);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.insertFailed} user registor`,
        error
      );
    }
  },

  async Delete(req, res) {
    try {
      const id = req.params.id;
      const userExists = await FindUserById_ID(id);
      if (!userExists) return SendError(res, `${EMessage.notFound}: user id`);
      const user = await prisma.users.update({
        where: { id },
        data: {
          is_active: false,
        },
      });
      return SendSuccess(res, `${EMessage.deleteSuccess}`, user);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.deleteFailed} user registor`,
        error
      );
    }
  },
  async ChangePassword(req, res) {
    try {
      const id = req.params.id;
      const validate = ValidateUserRegistor(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const { new_password, old_passoword } = req.body;

      const [userExists, password] = await Promise.all([
        FindUserById(id),
        Encrypt(new_password),
      ]);
      if (!userExists)
        return SendError(res, 404, `${EMessage.notFound} user id`);
      const decrypassword = await Decrypt(userExists.password);
      if (decrypassword !== old_passoword)
        return SendError(res, 400, `${EMessage.passwordnotmatch}`);
      const user = await prisma.users.update({
        where: {
          id: userExists.id,
        },
        data: {
          password,
          login_version: userExists.login_version,
        },
      });
      return SendSuccess(
        res,
        `${EMessage.updateSuccess} changed password`,
        user
      );
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} user registor`,
        error
      );
    }
  },
  async ForgotPassword(req, res) {
    try {
      const validate = ValidateForgotPassword(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const { phone_number, password } = req.body;

      const [userExists, hashpassword] = await Promise.all([
        FindUsersByPhone_number(phone_number),
        Encrypt(password),
      ]);

      if (!userExists)
        return SendError(res, 400, `${EMessage.notFound}:user phone_number`);
      const user = await prisma.users.update({
        where: { id: userExists.id },
        data: {
          password: hashpassword,
        },
      });
      return SendSuccess(res, `${EMessage.updateSuccess}`, user);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} user registor`,
        error
      );
    }
  },

  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);
      //----add promise to array----------------------------
      const promiseList = [FindUserById_ID(id)];
      if (data.username) {
        promiseList.push(FindUserUserNameAlready(data.username));
      }
      if (data.email) {
        promiseList.push(FindUserEmailAlready(data.email));
      }
      if (data.phone_number) {
        promiseList.push(FindUserPhone_NumberAlready(data.phone_number));
      }
      if (data.password) {
        promiseList.push(Encrypt(data.password));
      }

      const promise = await Promise.all(promiseList);

      //----shift Promise----------------------------------
      let usernameAlreadyExists,
        emailAlreadyExists,
        phone_numberAlreadyExists,
        hashpassword;
      const userExists = promise.shift();
      if (data.username) {
        usernameAlreadyExists = promise.shift();
      }
      if (data.email) {
        emailAlreadyExists = promise.shift();
      }
      if (data.phone_number) {
        phone_numberAlreadyExists = promise.shift();
      }
      if (data.password) {
        hashpassword = promise.shift();
      }
      //-----------------------------
      if (!userExists)
        return SendError(res, 404, `${EMessage.notFound}:user id`);
      if (
        (data.username && usernameAlreadyExists) ||
        (data.email && emailAlreadyExists) ||
        (data.phone_number && phone_numberAlreadyExists)
      )
        return SendError(
          res,
          400,
          `${EMessage.userAlreadyExists}:with ${
            data.username && usernameAlreadyExists
              ? "username"
              : data.email && emailAlreadyExists
              ? "email"
              : "phone_numberAlreadyExists"
          }`
        );

      const user = await prisma.users.update({
        where: {
          id,
        },
        data,
      });
      return SendSuccess(res, `${EMessage.updateSuccess}`, user);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} user registor`,
        error
      );
    }
  },
  async SelectOne(req, res) {
    try {
      const id = req.params.id;
      const user = await prisma.users.findUnique({
        where: {
          id,
          is_active: true,
        },
      });
      if (!user) return SendError(res, 404, `${EMessage.notFound}:user id`);
      return SendSuccess(res, `${EMessage.fetchOneSuccess}`, user);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} user registor`,
        error
      );
    }
  },
  async UpdateProfile(req, res) {
    try {
      const id = req.params.id;
      const { old_profile } = req.body;
      const data = req.files;

      if (!old_profile)
        return SendError(res, 400, `${EMessage.pleaseInput}: old_profile`);
      if (!data || !data.profile)
        return SendError(res, 400, `${EMessage.pleaseInput}: profile`);
      const userExists = await FindUserById_ID(id);
      if (!userExists)
        return SendError(res, 404, `${EMessage.notFound}:user id`);
      const profile = await UploadImage(data.profile.data, old_profile);
      if (!profile) throw new Error(`Upload image failed`);
      const user = await prisma.users.update({
        where: { id },
        data: {
          profile,
        },
      });
      return SendSuccess(res, `${EMessage.updateSuccess} profile`, user);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} user registor`,
        error
      );
    }
  },

  async SelectAllPage(req, res) {
    try {
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const promotion = await CachDataLimit(
        key + "-" + page,
        model,
        where,
        page,
        select
      );
      CachDataLimit(key + "-" + (page + 1), model, where, page + 1, select);
      return SendSuccess(
        res,
        `${EMessage.fetchOneSuccess} promotion`,
        promotion
      );
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.errorFetchingOne}`,
        error
      );
    }
  },
  async RefrechToken(req, res) {
    try {
      const { refrechtToken } = req.body;
      if (!refrechtToken)
        return SendError(res, 400, `${EMessage.pleaseInput}: refrechtToken`);
      const result = await verify_refresh_token(refrechtToken);
      if (!result) return SendError(res, "Error Generating refresh token");
      return SendSuccess(res, `${EMessage.refreshTokenSuccess}`, result);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.refreshTokenunSuccess}`,
        error
      );
    }
  },
};
export default UserController;
