import prisma from "../utils/prisma.client";

const createModelHandler = (modelName) => ({
  insert(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await prisma[modelName].createMany({
          data,
          // skipDuplicates: true,
        });
        console.log("Data inserted successfully " + modelName);
        resolve(result);
      } catch (error) {
        console.log("error :>> ", error);
        reject(error);
      }
    });
  },
  insertOne(data) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await prisma[modelName].create({
          data,
          // skipDuplicates: true,
        });
        console.log("Data inserted successfully " + modelName);
        resolve(result);
      } catch (error) {
        console.log("error :>> ", error);
        reject(error);
      }
    });
  },
  update(id, data) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await prisma[modelName].update({
          where: { id },
          data,
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  deleteWhere(where) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await prisma[modelName].delete({
          where,
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  delete(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await prisma[modelName].delete({
          where: { id },
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  findMany(where) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await prisma[modelName].findMany({
          where,
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  findUnique(where) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await prisma[modelName].findUnique({
          where,
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
  findFirst(where) {
    prisma.users.findFirst;
    return new Promise(async (resolve, reject) => {
      try {
        const result = await prisma[modelName].findFirst({
          where,
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
});

const Kyc_doc_image = createModelHandler("kyc_doc_image");
// Creating handlers for each model
const Post_doc_image = createModelHandler("post_doc_image");
const Post_driver_license_image = createModelHandler(
  "post_driver_license_image"
);
const Post_car_image = createModelHandler("post_car_image");
const Post_insurance_image = createModelHandler("post_insurance_image");
const Post_rent_data = createModelHandler("post_rent_data");
const Post_label_data = createModelHandler("labels_data");
const Post_like_posts = createModelHandler("like_post");
//-------Car_rend------------------------------------------------
const Car_rent_doc_image = createModelHandler("car_rent_doc_image");
const Car_rent_payment_image = createModelHandler("car_rent_payment_image");
const Car_rent_visa = createModelHandler("car_rent_visa");
const Car_rent_driving_lincense_image = createModelHandler(
  "car_rent_driving_lincense_image"
);

// const Kyc_noti = createModelHandler("kyc_noti");

const Popular_places_images = createModelHandler("popular_places_images");
export {
  Kyc_doc_image,
  //--------------------
  Post_doc_image,
  Post_driver_license_image,
  Post_car_image,
  Post_insurance_image,
  Post_rent_data,
  Post_label_data,
  Post_like_posts,
  //--------------------
  Car_rent_doc_image,
  Car_rent_driving_lincense_image,
  Car_rent_payment_image,
  Car_rent_visa,

  //------Notification------------
  Popular_places_images,
};
