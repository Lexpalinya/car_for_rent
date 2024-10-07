import redis from "../../DB/redis";

import { EMessage } from "../../services/enum";
import { FindCar_Rent_StatusById, FindCar_rentById } from "../../services/find";
import { SendNotificationToUser } from "../../services/noti.services";
import { S3UploadImage } from "../../services/s3UploadImage";
import { SendError, SendErrorLog, SendSuccess } from "../../services/services";
import { UploadImage } from "../../services/upload.file";
import { language } from "../../utils/noti.language";
import prisma from "../../utils/prisma.client";

import { RecacheDataPost } from "../post/post.controller";
import { ResCachedDataCar_rent } from "./car_rent.controller";
let key = "car_rent";
export const UpdateCar_rentImage = async (
  req,
  res,
  imageType,
  findImageById,
  updateImage
) => {
  try {
    const id = req.params.id;
    let { image_data_update } = req.body;

    if (!image_data_update) {
      return SendError(res, 400, `${EMessage.pleaseInput}: image_data_update`);
    }

    if (typeof image_data_update === "string") {
      image_data_update = JSON.parse(image_data_update);
    }

    if (
      !image_data_update.id ||
      !image_data_update.url ||
      !image_data_update.car_rent_id
    ) {
      return SendError({
        res,
        statuscode: 400,
        message: `${EMessage.pleaseInput}`,
        err: ` ${imageType} type object {id,car_rent_id,url}`,
      });
    }

    const data = req.files;

    if (!data || !data[imageType]) {
      return SendError({
        res,
        statuscode: 400,
        message: `${EMessage.pleaseInput}`,
        err: ` ${imageType}`,
      });
    }

    const [car_rentExists, imageExists] = await Promise.all([
      FindCar_rentById(id),
      findImageById({ id: image_data_update.id }),
    ]);

    if (!car_rentExists || !imageExists) {
      return SendError({
        res,
        statuscode: 404,
        message: `${EMessage.notFound}`,
        err: ` ${!car_rentExists ? "car_rent" : imageType} id`,
      });
    }
    if (id !== imageExists.car_rent_id)
      return SendError({
        res,
        statuscode: 400,
        message: `you not own car_rent`,
        err: `you not own car_rent`,
      });
    // const imageUrl = await UploadImage(
    //   data[imageType].data,
    //   image_data_update.url
    // );

    const imageUrl = await S3UploadImage(
      data[imageType],
      image_data_update.url
    );
    if (!imageUrl) {
      throw new Error(`upload ${imageType} failed`);
    }

    const imageUpdate = await updateImage(image_data_update.id, {
      url: imageUrl,
    });
    await ResCachedDataCar_rent({
      id,
      key,
      post_key: car_rentExists.post_id,
      user_key: car_rentExists.user_id,
      pay_status: car_rentExists.pay_status,
      user_post_key: car_rentExists.user_id + "post",
    });
    return SendSuccess({
      res,
      message: `${EMessage.updateSuccess} update ${imageType}`,
      data: imageUpdate,
    });
  } catch (err) {
    return SendErrorLog({
      res,
      message: `${EMessage.serverError} ${EMessage.updateFailed} car_rent ${imageType}`,
      err,
    });
  }
};

export const UpdateStatusUser = async (
  req,
  res,
  newStatusId,
  notificationTitle,
  notificationText,
  notificationTitleUserpost,
  notificationTextUserpost,
  postStatusId
) => {
  try {
    const id = req.params.id;
    let { isShowPost } = req.body;
    let additionalPostData = {};

    if (isShowPost !== undefined) {
      additionalPostData.isShowPost =
        typeof isShowPost === "boolean" ? isShowPost : isShowPost === "true";
    }

    const [car_rentExists, statusExists] = await Promise.all([
      FindCar_rentById(id),
      FindCar_Rent_StatusById(newStatusId),
    ]);
    if (!car_rentExists || !statusExists)
      return SendError({
        res,
        message: `${EMessage.notFound}`,
        err: `${!car_rentExists ? "car_rent_id" : "status_id"}`,
      });

    const car_rent = await prisma.car_rent.update({
      where: { id },
      data: { status_id: newStatusId },
    });

    await Promise.all([
      ResCachedDataCar_rent({
        id,
        key,
        post_key: car_rentExists.post_id,
        user_key: car_rentExists.user_id,
        pay_status: car_rentExists.pay_status,
        user_post_key: car_rentExists.post.user_id + "post",
      }),
      ResCachedDataCar_rent({
        id,
        key,
        post_key: car_rent.post_id,
        user_key: car_rent.user_id,
        pay_status: car_rent.pay_status,
        user_post_key: car_rent.user_id + "post",
      }),
    ]);

    const dt = await FindCar_rentById(id);
    const post = await prisma.posts.update({
      where: { id: dt.post_id },
      data: { status_id: postStatusId, ...additionalPostData },
    });

    SendNotificationToUser({
      title: language[dt.user.language][notificationTitle],
      text: language[dt.user.language][notificationText],
      image: AWS_BASE_URL + dt?.post?.post_car_image[0]?.url,
      ref_id: dt.id,
      user_id: dt.user_id,
      role: "customer",
      type: "car_rent_user_rent",
    });
    SendNotificationToUser({
      title: language[dt.post.users.language][notificationTitleUserpost],
      text: language[dt.post.users.language][notificationTextUserpost],
      image: AWS_BASE_URL + dt?.post?.post_car_image[0]?.url,
      ref_id: dt.id,
      user_id: dt.post.user_id,
      role: "customer",
      type: "car_rent_user_post",
    });
    await Promise.all([
      RecacheDataPost({
        key: "posts",
        car_type_id_key: post.car_type_id + "posts",
        type_of_fual_id_key: post.type_of_fual_id + "posts",
        user_id_key: post.user_id + "posts",
        post_status_key: post.status_id + "posts",
      }),
      redis.del(post.id + "posts-edit", post.id + "posts"),
    ]);
    return SendSuccess({
      res,
      message: `${EMessage.deleteSuccess}`,
      data: dt,
    });
  } catch (err) {
    return SendErrorLog({
      res,
      message: `${EMessage.serverError} ${EMessage.updateFailed} `,
      err,
    });
  }
};
