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
import {
  DataExists,
  ValidateChangePassword,
  ValidateForgotPassword,
  ValidateLogin,
  ValidateLoginPhoneNumber,
  ValidateUserRegistor,
} from "../services/validate";
import { UploadImage } from "../services/upload.file";
import {
  FindUserById,
  FindUserById_ID,
  FindUserEmailAlready,
  FindUserPhone_NumberAlready,
  FindUserUserNameAlready,
} from "../services/find";
import { DeleteCachedKey } from "../services/cach.deletekey";
import redis from "../DB/redis";
import { CachDataLimit } from "../services/cach.contro";

let key = "users";
let model = "users";
let where = { is_active: true };
let select = {
  id: true,
  is_active: true,
  username: true,
  email: true,
  phone_number: true,
  password: true,
  profile: true,
  fackbook_id: true,
  google_id: true,
  device_token: true,
  login_version: true,
  role: true,
  created_at: true,
  updated_at: true,
};

const RecacheData = async (id = "", { page = true }) => {
  let promise = [redis.del([id + key, "ID_user"])];
  if (page === true) {
    promise.push(DeleteCachedKey(key));
  }
  await Promise.all(promise);
  const promise2 = [];

  promise2.push(FindUserById_ID(""));

  if (id !== "") {
    promise2.push(FindUserById(id));
  }
  if (page === true) {
    promise2.push(CachDataLimit(key + "-" + "0", model, where, 0, select));
  }

  await Promise.all(promise2);
};

const UsersController = {
  async Registor(req, res) {
    try {
      await redis.del("ID_user");
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

      let data = req.files;
      if (!data) {
        data = { profile: "" };
      }
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
      console.log("object :>> ", usernameAlreadyExists);
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
              : "phone_number"
          }`
        );
      let profile;
      if (data.profile !== "") {
        profile = await UploadImage(data.profile.data);
      }

      const user = await prisma.users.create({
        data: {
          username,
          email,
          password: hashpassword,
          phone_number,
          fackbook_id,
          google_id,
          device_token,
          profile,
        },
        select,
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

      await RecacheData(user.id, { page: true });
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
      const user = await prisma.users.update(
        {
          where: { id },
          data: {
            is_active: false,
          },
        },
        select
      );
      await RecacheData(user.id, { page: true });
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
      const validate = ValidateChangePassword(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const { new_password, old_password } = req.body;

      const [userExists, password] = await Promise.all([
        FindUserById_ID(id),
        Encrypt(new_password),
      ]);
      if (!userExists)
        return SendError(res, 404, `${EMessage.notFound} user id`);
      const decrypassword = await Decrypt(userExists.password);
      if (decrypassword !== old_password)
        return SendError(res, 400, `${EMessage.passwordnotmatch}`);
      const user = await prisma.users.update({
        where: {
          id: userExists.id,
        },
        data: {
          password,
          login_version: userExists.login_version + 1,
        },
        select,
      });
      await RecacheData(user.id, { page: true });
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
      const { phone_number, new_password } = req.body;

      const [userExists, hashpassword] = await Promise.all([
        FindUserPhone_NumberAlready(phone_number),
        Encrypt(new_password),
      ]);
      if (!userExists)
        return SendError(res, 400, `${EMessage.notFound}:user phone_number`);
      const user = await prisma.users.update({
        where: { id: userExists.id },
        data: {
          password: hashpassword,
        },
        select,
      });
      await RecacheData(user.id, { page: false });
      return SendSuccess(res, `${EMessage.updateSuccess}`, user);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} user registor`,
        error
      );
    }
  },

  async Login(req, res) {
    try {
      const validate = ValidateLogin(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const { username, password } = req.body;
      const userExists = await FindUserUserNameAlready(username);
      // console.log("userExists :>> ", userExists);
      if (!userExists)
        return SendError(res, 404, `${EMessage.notFound}: user by username`);
      const decrypassword = await Decrypt(userExists.password);
      // console.log("decrypassword :>> ", decrypassword);
      if (decrypassword !== password)
        return SendError(
          res,
          400,
          `${EMessage.loginFailed} password not match `
        );
      const user = await prisma.users.update({
        where: { id: userExists.id },
        data: {
          login_version: userExists.login_version + 1,
        },
        select,
      });
      const token_data = {
        id: user.id,
        login_version: user.login_version,
      };
      const token = await generateToken(token_data);
      const result = {
        ...user,
        token,
      };
      await RecacheData(user.id, { page: false });
      return SendSuccess(res, `${EMessage.loginSuccess}`, result);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.loginFailed} user registor`,
        error
      );
    }
  },
  async LoginPhoneNumber(req, res) {
    try {
      const validate = ValidateLoginPhoneNumber(req.body);
      if (validate.length > 0)
        return SendError(
          res,
          400,
          `${EMessage.pleaseInput}: ${validate.join(", ")}`
        );
      const { phone_number, password } = req.body;
      const userExists = await FindUserPhone_NumberAlready(phone_number);
      console.log("userExists :>> ", userExists);
      if (!userExists)
        return SendError(
          res,
          404,
          `${EMessage.notFound}: user by phone_number`
        );
      const decrypassword = await Decrypt(userExists.password);
      console.log("decrypassword :>> ", decrypassword);
      if (decrypassword !== password)
        return SendError(
          res,
          400,
          `${EMessage.loginFailed} password not match `
        );
      const user = await prisma.users.update({
        where: { id: userExists.id },
        data: {
          login_version: userExists.login_version + 1,
        },
        select,
      });
      const token_data = {
        id: user.id,
        login_version: user.login_version,
      };
      const token = await generateToken(token_data);
      const result = {
        ...user,
        token,
      };
      await RecacheData(user.id, { page: false });
      return SendSuccess(res, `${EMessage.loginSuccess}`, result);
    } catch (error) {
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.loginFailed} user registor`,
        error
      );
    }
  },
  async Update(req, res) {
    try {
      const id = req.params.id;
      const data = DataExists(req.body);

      // Prepare the list of promises to execute concurrently
      const promiseList = [FindUserById_ID(id)];
      const checks = {}; // Store whether checks were made

      if (data.username) {
        promiseList.push(FindUserUserNameAlready(data.username));
        checks.username = true;
      }
      if (data.email) {
        promiseList.push(FindUserEmailAlready(data.email));
        checks.email = true;
      }
      if (data.phone_number) {
        promiseList.push(FindUserPhone_NumberAlready(data.phone_number));
        checks.phone_number = true;
      }
      if (data.password) {
        promiseList.push(Encrypt(data.password));
      }

      // Execute all promises concurrently
      const results = await Promise.all(promiseList);

      // Extract results
      const userExists = results.shift();
      let usernameAlreadyExists, emailAlreadyExists, phone_numberAlreadyExists;

      if (checks.username) usernameAlreadyExists = results.shift();
      if (checks.email) emailAlreadyExists = results.shift();
      if (checks.phone_number) phone_numberAlreadyExists = results.shift();
      if (data.password) data.password = results.shift();

      // Check if user exists
      if (!userExists) {
        return SendError(res, 404, `${EMessage.notFound}: user id`);
      }
      console.log("object :>> ", usernameAlreadyExists);

      // Check for existing username, email, or phone number
      if (
        (checks.username && usernameAlreadyExists) ||
        (checks.email && emailAlreadyExists) ||
        (checks.phone_number && phone_numberAlreadyExists)
      ) {
        const existingField = usernameAlreadyExists
          ? "username"
          : emailAlreadyExists
          ? "email"
          : "phone number";

        return SendError(
          res,
          400,
          `${EMessage.userAlreadyExists}: with ${existingField}`
        );
      }

      // Update user data
      const user = await prisma.users.update({
        where: { id },
        data,
        select,
      });

      // Re-cache user data
      await RecacheData(user.id, { page: true });

      // Send success response
      return SendSuccess(res, `${EMessage.updateSuccess}`, user);
    } catch (error) {
      // Handle errors and log them
      SendErrorLog(
        res,
        `${EMessage.serverError} ${EMessage.updateFailed} user registration`,
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
        select,
      });
      await RecacheData(user.id, { page: true });
      return SendSuccess(res, `${EMessage.updateSuccess} profile`, user);
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
      const user = await FindUserById(id);
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

  async SelectAllPage(req, res) {
    try {
      let page = parseInt(req.query.page);
      page = !page || page < 0 ? 0 : page - 1;
      const user = await CachDataLimit(
        key + "-" + page,
        model,
        where,
        page,
        select
      );
      CachDataLimit(key + "-" + (page + 1), model, where, page + 1, select);
      return SendSuccess(res, `${EMessage.fetchOneSuccess} user`, user);
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
      const { refrechToken } = req.body;
      if (!refrechToken)
        return SendError(res, 400, `${EMessage.pleaseInput}: refrechToken`);
      const result = await verify_refresh_token(refrechToken);
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
export default UsersController;
