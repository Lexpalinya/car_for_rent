import cloudinary from "../config/cloudinary";
import { S3UploadImage } from "./s3UploadImage";

export const UploadImage = (image, old_image) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (old_image) {
        const split_url = old_image.split("/");
        const img_id = split_url[split_url.length - 1].split(".")[0];
        cloudinary.uploader.destroy(img_id);
      }

      const base_64 = image.toString("base64");
      const img_path = `data:image/webp;base64,${base_64}`;
      const result = await cloudinary.uploader.upload(img_path, {
        public_id: `IMG_${Date.now()}`,
        result_type: "image",
        format: "webp",
        // transformation: [
        //   { width: 1000, crop: "scale" },
        //   { quality: "auto:best" },
        //   { fetch_format: "auto" },
        // ],
      });
      return resolve(result.url);
    } catch (error) {
      return reject(error);
    }
  });
};

export const DeleteImage = (image) => {
  return new Promise(async (resolve, reject) => {
    try {
      const split_url = image.split("/");
      const img_id = split_url[split_url.length - 1].split(".")[0];
      const result = await cloudinary.uploader.destroy(img_id);

      return resolve(result);
    } catch (error) {
      return reject(error);
    }
  });
};

export const uploadImages = (images) => {
  return Promise.all(
    images.map((img) =>
      S3UploadImage(img).then((url) => {
        if (!url) {
          throw new Error("Upload Image failed");
        }
        return url;
      })
    )
  );
};
