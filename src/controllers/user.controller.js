import { generateToken } from "../config/generate.token";
import { EMessage } from "../services/enum";
import {
  CheckUserBlackList,
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
  ValidateCheckUsernameAndPhone_number,
  ValidateFacebook,
  ValidateForgotPassword,
  ValidateGoogle,
  ValidateLogin,
  ValidateLoginEmail,
  ValidateLoginPhoneNumber,
  ValidateUserRegistor,
} from "../services/validate";
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
import { S3UploadImage } from "../services/s3UploadImage";

let key = "users";
let model = "users";
let where = { is_active: true };
let select = {
  id: true,
  is_active: true,
  username: true,
  email: true,
  phone_number: true,
  profile: true,
  first_name: true,
  last_name: true,
  fackbook_id: true,
  google_id: true,
  kyc: true,
  blacklist: true,
  device_token: true,
  login_version: true,
  // is_vertified: true,
  created_at: true,
  updated_at: true,
};

export const RecacheData = async (id = "", { page = true }) => {
  let promise = [redis.del([id + key, "ID_user"])];
  console.log('redis.get("ID_user") :>> ', await redis.get("ID_user"));
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
        return SendError({
          res,
          status: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
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
      const [usernameAlreadyExists, phone_numberAlreadyExists, hashpassword] =
        await Promise.all([
          FindUserUserNameAlready(username),
          FindUserPhone_NumberAlready(phone_number),
          Encrypt(password),
        ]);

      if (usernameAlreadyExists || phone_numberAlreadyExists)
        return SendError({
          res,
          statuscode: 400,
          message: EMessage.userAlreadyExists,
          err: usernameAlreadyExists ? "username" : "phone_number",
        });
      let profile;
      if (data.profile !== "") {
        profile = await S3UploadImage(data.profile);
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
        ...token,
      };

      await RecacheData(user.id, { page: true });
      await redis.del("count_user");
      return SendCreate({
        res,
        message: `${EMessage.registrationSuccess} `,
        data: result,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.insertFailed} user registor`,
        err,
      });
    }
  },

  async Delete(req, res) {
    try {
      const user_id = req.user;
      const userid = req.query.user_id;
      const id = !userid ? user_id : userid;
      const userExists = await FindUserById_ID(id);
      if (!userExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound} user`,
          err: "id",
        });
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
      await redis.del("count_user");
      return SendSuccess({
        res,
        message: `${EMessage.deleteSuccess}`,
        data: user,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.deleteFailed} user`,
        err,
      });
    }
  },
  async ChangePassword(req, res) {
    try {
      const id = req.user;

      const validate = ValidateChangePassword(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: EMessage.pleaseInput,
          err: validate.join(", "),
        });
      const { new_password, old_password } = req.body;

      const [userExists, password] = await Promise.all([
        FindUserById_ID(id),
        Encrypt(new_password),
      ]);
      if (!userExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound} user`,
          err: "id",
        });
      CheckUserBlackList(res, userExists);
      const decrypassword = await Decrypt(userExists.password);
      if (decrypassword !== old_password)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.changePasswordfailed}`,
          err: EMessage.passwordnotmatch,
        });
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
      return SendSuccess({
        res,
        message: `${EMessage.changePasswordsuccess}`,
        data: user,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} user change password`,
        err,
      });
    }
  },
  async ForgotPassword(req, res) {
    try {
      const validate = ValidateForgotPassword(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { phone_number, new_password } = req.body;

      const [userExists, hashpassword] = await Promise.all([
        FindUserPhone_NumberAlready(phone_number),
        Encrypt(new_password),
      ]);
      if (!userExists)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.notFound} user`,
          err: "phone_number",
        });
      CheckUserBlackList(res, userExists);
      const user = await prisma.users.update({
        where: { id: userExists.id },
        data: {
          password: hashpassword,
        },
        select,
      });
      await RecacheData(user.id, { page: false });
      return SendSuccess({
        res,
        message: `${EMessage.forgotpassowordsuccess}`,
        data: user,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.forgotpassowordfailure} user `,
        err,
      });
    }
  },

  async Login(req, res) {
    try {
      const validate = ValidateLogin(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { username, password } = req.body;
      const userExists = await FindUserUserNameAlready(username);
      console.log("userE :>> ", userExists);
      if (!userExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: user`,
          err: "username",
        });
      CheckUserBlackList(res, userExists);
      const decrypassword = await Decrypt(userExists.password);

      if (decrypassword !== password)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.loginFailed}  `,
          err: EMessage.passwordnotmatch,
        });
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
        ...token,
      };
      await RecacheData(user.id, { page: false });
      return SendSuccess({
        res,
        message: `${EMessage.loginSuccess}`,
        data: result,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.loginFailed} user login username`,
        err,
      });
    }
  },
  async LoginPhoneNumber(req, res) {
    try {
      const validate = ValidateLoginPhoneNumber(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { phone_number, password } = req.body;
      const userExists = await FindUserPhone_NumberAlready(phone_number);
      if (!userExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: user`,
          err: "phone_number",
        });
      CheckUserBlackList(res, userExists);
      const decrypassword = await Decrypt(userExists.password);

      if (decrypassword !== password)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.loginFailed} `,
          err: EMessage.passwordnotmatch,
        });
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
        ...token,
      };
      await RecacheData(user.id, { page: false });
      return SendSuccess({
        res,
        message: `${EMessage.loginSuccess}`,
        data: result,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.loginFailed} user login phone_number`,
        err,
      });
    }
  },
  async LoginEmail(req, res) {
    try {
      const validate = ValidateLoginEmail(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { email, password } = req.body;
      const userExists = await FindUserEmailAlready(email);
      if (!userExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound}: user`,
          err: "email",
        });
      CheckUserBlackList(res, userExists);
      const decrypassword = await Decrypt(userExists.password);

      if (decrypassword !== password)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.loginFailed} `,
          err: EMessage.passwordnotmatch,
        });
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
        ...token,
      };
      await RecacheData(user.id, { page: false });
      return SendSuccess({
        res,
        message: `${EMessage.loginSuccess}`,
        data: result,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.loginFailed} user login email`,
        err,
      });
    }
  },
  async Update(req, res) {
    try {
      const user_id = req.user;
      const userid = req.query.user_id;
      const id = !userid ? user_id : userid;
      const data = DataExists(req.body);
      // Prepare the list of promises to execute concurrently
      const promiseList = [FindUserById_ID(id)];
      const checks = {}; // Store whether checks were made
      if (data.kyc && typeof data.kyc !== "boolean")
        data.kyc = data.kyc === "true";

      if (data.blacklist && typeof data.blacklist !== "boolean")
        data.blacklist = data.blacklist === "true";

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
      if (!userExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound} user`,
          err: "id",
        });

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

        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.userAlreadyExists}`,
          err: `${existingField}`,
        });
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
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess}`,
        data: user,
      });
    } catch (err) {
      // Handle errors and log them
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed}`,
        err,
      });
    }
  },
  async UpdateProfile(req, res) {
    try {
      const user_id = req.user;
      const userid = req.query.user_id;
      const id = !userid ? user_id : userid;
      const { old_profile } = req.body;
      const data = req.files;

      if (!old_profile)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: " old_profile",
        });
      if (!data || !data.profile)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: "profile",
        });
      const userExists = await FindUserById_ID(id);
      if (!userExists)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound} user`,
          err: "id",
        });
      const profile = await S3UploadImage(data.profile, old_profile);
      if (!profile) throw new Error(`Upload image failed`);
      const user = await prisma.users.update({
        where: { id },
        data: {
          profile,
        },
        select,
      });
      await RecacheData(user.id, { page: true });
      return SendSuccess({
        res,
        message: `${EMessage.updateSuccess} user profile`,
        data: user,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.updateFailed} user `,
        err,
      });
    }
  },
  async SelectOne(req, res) {
    try {
      const user_id = req.user;
      const userid = req.query.user_id;
      const id = !userid ? user_id : userid;
      const user = await FindUserById(id);
      if (!user)
        return SendError({
          res,
          statuscode: 404,
          message: `${EMessage.notFound} user`,
          err: "id",
        });
      let token;
      if (!userid) {
        token = await generateToken({
          id: user.id,
          loginversion: user.loginversion,
        });
      }
      return SendSuccess({
        res,
        message: `${EMessage.fetchOneSuccess}`,
        data: {
          ...user,
          ...token,
        },
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingOne} user `,
        err,
      });
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
      return SendSuccess({
        res,
        message: `${EMessage.fetchAllSuccess} user`,
        data: user,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.errorFetchingAll}`,
        err,
      });
    }
  },
  async RefrechToken(req, res) {
    try {
      const { refrechToken } = req.body;
      if (!refrechToken)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: `refrechToken`,
        });

      const result = await verify_refresh_token(refrechToken);
      if (!result)
        return SendError({
          res,
          statuscode: 401,
          message: "Error Generating refresh token",
        });
      return SendSuccess({
        res,
        message: `${EMessage.refreshTokenSuccess}`,
        data: result,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.refreshTokenunSuccess} `,
        err,
      });
    }
  },
  async CheckUsernameandPhone_number(req, res) {
    try {
      const validate = ValidateCheckUsernameAndPhone_number(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { username, phone_number } = req.body;
      const [usernameAlreadyExists, phone_numberAlreadyExists] =
        await Promise.all([
          FindUserUserNameAlready(username),
          FindUserPhone_NumberAlready(phone_number),
        ]);

      if (usernameAlreadyExists || phone_numberAlreadyExists)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.userAlreadyExists}`,
          err: usernameAlreadyExists ? "username" : "phone_number",
        });
      return SendSuccess({ res, message: `ready to register` });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} Check Username and Phone number error`,
        err,
      });
    }
  },
  async GoogleSignInAndSignUp(req, res) {
    try {
      const validate = ValidateGoogle(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { id, name, email, image } = req.body;
      const checksAccount = await FindUserEmailAlready(email);
      if (checksAccount) {
        const user = await prisma.users.update({
          where: { id: checksAccount.id, is_active: true },
          data: {
            login_version: checksAccount.login_version + 1,
          },
          select,
        });
        if (user.google_id !== id)
          return SendError({
            res,
            statuscode: 400,
            message: `sign in google failed`,
            err: `google_id not match`,
          });

        const token_data = {
          id: user.id,
          login_version: user.login_version,
        };

        const token = await generateToken(token_data);
        const result = {
          ...user,
          ...token,
        };
        await RecacheData(user.id, { page: true });

        return SendSuccess({
          res,
          message: `${EMessage.loginSuccess}`,
          data: result,
        });
      } else {
        const user = await prisma.users.create({
          data: {
            username: name,
            profile: image,
            email,
            google_id: id,
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
          ...token,
        };
        await RecacheData(user.id, { page: true });
        return SendSuccess({
          res,
          message: `Sign up User Success`,
          data: result,
        });
      }
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.loginFailed} sign in and sign up failed google`,
        err,
      });
    }
  },

  async FaceBookSignInAndSignUp(req, res) {
    try {
      const validate = ValidateFacebook(req.body);
      if (validate.length > 0)
        return SendError({
          res,
          statuscode: 400,
          message: `${EMessage.pleaseInput}`,
          err: validate.join(", "),
        });
      const { id, name, email, image } = req.body;
      const checksAccount = await FindUserEmailAlready(email);
      if (checksAccount) {
        const user = await prisma.users.update({
          where: { id: checksAccount.id, is_active: true },
          data: {
            login_version: checksAccount.login_version + 1,
          },
          select,
        });
        if (user.google_id !== id)
          return SendError({
            res,
            statuscode: 400,
            message: `sign in facebook failed`,
            err: `fackbook_id not match`,
          });
        const token_data = {
          id: user.id,
          login_version: user.login_version,
        };

        const token = await generateToken(token_data);
        const result = {
          ...user,
          ...token,
        };
        await RecacheData(user.id, { page: true });

        return SendSuccess({
          res,
          message: `${EMessage.loginSuccess}`,
          data: result,
        });
      } else {
        const user = await prisma.users.create({
          data: {
            username: name,
            profile: image,
            email,
            fackbook_id: id,
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
          ...token,
        };
        await RecacheData(user.id, { page: true });
        return SendSuccess({
          res,
          message: `Sign up User Success`,
          data: result,
        });
      }
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.loginFailed} sign in and sign up failed facebook`,
        err,
      });
    }
  },
  async CountUser(req, res) {
    try {
      const dataCasch = await redis.get("count_user");
      let result;
      if (!dataCasch) {
        const [total_user, user_post, user_rent] = await Promise.all([
          prisma.users.count({
            where: { is_active: true },
          }),
          prisma.users.count({
            where: {
              is_active: true,
              kyc: true,
            },
          }),
          prisma.users.count({
            where: {
              is_active: true,
              kyc: false,
            },
          }),
        ]);
        result = {
          total_user,
          user_post,
          user_rent,
        };
        await redis.set("count_user", JSON.stringify(result), "EX", 3600);
      } else {
        result = JSON.parse(dataCasch);
      }

      return SendSuccess({
        res,
        message: `count user`,
        data: result,
      });
    } catch (err) {
      SendErrorLog({
        res,
        message: `${EMessage.serverError} ${EMessage.fetchAllSuccess} count user`,
        err,
      });
    }
  },
};
export default UsersController;
