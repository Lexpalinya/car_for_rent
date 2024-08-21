import cloudinary from "../config/cloudinary";

export const UploadImage = (image, old_image) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (old_image) {
        const split_url = old_image.split("/");
        const img_id = split_url[split_url.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(img_id);
      }

      const base_64 = image.data.toString("base64");
      const img_path = `data:image/webp;base64,${base_64}`;
      const result = await cloudinary.uploader.upload(img_path, {
        public_id: `IMG_${Date.now()}`,
        result_type: "image",
        format: "webp",
      });
      return reject(result.url);
    } catch (error) {
      return reject(error);
    }
  });
};
