import express from "express";
import PromotionController from "../controllers/promotion.controller";
import BannerController from "../controllers/banner.controller";
import Car_BrandsController from "../controllers/car_brands.controller";
import Car_typesController from "../controllers/car_types.controller";
import Insurance_companysController from "../controllers/insurance_companies.controller";
import LabelsController from "../controllers/labels.controller";
import Level_InsurancesController from "../controllers/level_insurance.controller";
import Type_of_FualsController from "../controllers/type_of_fuals.controller";
import Post_StatusController from "../controllers/post_status.controller";
import Car_Rent_StatusController from "../controllers/rent_status.controller";
import UsersController from "../controllers/user.controller";
import WalletController from "../controllers/wallet.controller";
import PostController from "../controllers/post.controller";
import Post_rent_dataController from "../controllers/post_rent_dataController";
import {
  Post_car_imageController,
  Post_doc_imageController,
  Post_driver_license_imageController,
  Post_insurance_imageController,
} from "../controllers/post_image.controller";
import Like_postController from "../controllers/like_post.controller";
import Labels_DataController from "../controllers/labels_data.controller";
import ReviewController from "../controllers/review.controller";
import Car_rentController from "../controllers/car_rent.controller";
import { admin, auth } from "../middleware/auth";
import LocationController from "../controllers/location.controller";
const route = express.Router();

//-----------Promotion-------------------------
const promotion = "/promotion";
route.get(`${promotion}/selOne/:id`, auth, PromotionController.SelecOne);
route.get(`${promotion}/selAll`, auth, admin, PromotionController.SelectAll);
route.get(`${promotion}/selIsPublic`, auth, PromotionController.SelectIsPublic);
route.get(
  `${promotion}/selAllpages`,
  auth,
  admin,
  PromotionController.SelectPage
);

route.post(`${promotion}/insert`, auth, admin, PromotionController.Insert);

route.delete(
  `${promotion}/delete/:id`,
  auth,
  admin,
  PromotionController.Delete
);

route.put(`${promotion}/update/:id`, auth, admin, PromotionController.Update);

//-----------Banner--------------------------------------
const banners = "/banner";
route.get(`${banners}/selAll`, auth, admin, BannerController.SelectAll);
route.get(`${banners}/selIsPublic`, auth, BannerController.SelectIsPublic);

route.post(`${banners}/insert`, auth, admin, BannerController.Insert);

route.put(`${banners}/update/:id`, auth, admin, BannerController.Update);
route.put(
  `${banners}/updateIsPublic/:id`,
  auth,
  admin,
  BannerController.Update_Is_public
);
route.delete(`${banners}/delete/:id`, auth, admin, BannerController.Delete);

//---------------Car_brands-------------------------------------
const car_brands = `/car_brands`;
route.get(`${car_brands}/selAll`, auth, Car_BrandsController.SelectAll);
route.get(`${car_brands}/selOne/:id`, auth, Car_BrandsController.SelectOne);

route.post(`${car_brands}/insert`, auth, Car_BrandsController.Insert);

route.put(`${car_brands}/update/:id`, auth, Car_BrandsController.Update);
route.put(
  `${car_brands}/updateIcon/:id`,
  auth,
  Car_BrandsController.UpdateIcon
);

route.delete(`${car_brands}/delete/:id`, auth, Car_BrandsController.Delete);

//-----------------------Car_type-----------------------------------------
const car_types = `/car_types`;
route.get(`${car_types}/selAll`, auth, Car_typesController.SelectAll);
route.get(`${car_types}/selOne/:id`, auth, Car_typesController.SelectOne);

route.post(`${car_types}/insert`, auth, Car_typesController.Insert);

route.put(`${car_types}/update/:id`, auth, Car_typesController.Update);
route.put(`${car_types}/updateIcon/:id`, auth, Car_typesController.UpdateIcon);
route.delete(`${car_types}/delete/:id`, auth, Car_typesController.Delete);

//---------Insurance_companys-------------------------------------------------------

const insurance_companies = `/insurance_companies`;
route.get(
  `${insurance_companies}/selAll`,
  auth,
  Insurance_companysController.SelectAll
);
route.get(
  `${insurance_companies}/selOne/:id`,
  auth,
  Insurance_companysController.SelectOne
);
route.post(
  `${insurance_companies}/insert`,
  auth,
  Insurance_companysController.Insert
);
route.put(
  `${insurance_companies}/update/:id`,
  auth,
  Insurance_companysController.Update
);
route.put(
  `${insurance_companies}/updateIcon/:id`,
  auth,
  Insurance_companysController.UpdateIcon
);
route.delete(
  `${insurance_companies}/delete/:id`,
  auth,
  Insurance_companysController.Delete
);

//-----------Labels-----------------------------------------------------
const labels = `/labels`;
route.get(`${labels}/selAll`, auth, LabelsController.SelectAll);
route.get(`${labels}/selOne/:id`, auth, LabelsController.SelectOne);

route.post(`${labels}/insert`, auth, LabelsController.Insert);

route.put(`${labels}/update/:id`, auth, LabelsController.Update);
route.put(`${labels}/updateIcon/:id`, auth, LabelsController.UpdateIcon);

route.delete(`${labels}/delete/:id`, auth, LabelsController.Delete);

//-----------Type_of_fuals-----------------------------------------------------
const type_of_fuals = `/type_of_fuals`;
route.get(`${type_of_fuals}/selAll`, auth, Type_of_FualsController.SelectAll);
route.get(
  `${type_of_fuals}/selOne/:id`,
  auth,
  Type_of_FualsController.SelectOne
);

route.post(`${type_of_fuals}/insert`, auth, Type_of_FualsController.Insert);

route.put(`${type_of_fuals}/update/:id`, auth, Type_of_FualsController.Update);
route.put(
  `${type_of_fuals}/updateIcon/:id`,
  auth,
  Type_of_FualsController.UpdateIcon
);

route.delete(
  `${type_of_fuals}/delete/:id`,
  auth,
  Type_of_FualsController.Delete
);

//----------Level_Insurance----------------------------------------------------------
const level_insurances = "/level_insurances";

route.get(
  `${level_insurances}/selAll`,
  auth,
  Level_InsurancesController.SelectAll
);
route.get(
  `${level_insurances}/selOne/:id`,
  auth,
  Level_InsurancesController.SelectOne
);
route.post(
  `${level_insurances}/insert`,
  auth,
  Level_InsurancesController.Insert
);
route.put(
  `${level_insurances}/update/:id`,
  auth,
  Level_InsurancesController.Update
);
route.delete(
  `${level_insurances}/delete/:id`,
  auth,
  Level_InsurancesController.Delete
);

//----------Level_Insurance----------------------------------------------------------
const post_status = "/post_status";

route.get(`${post_status}/selAll`, auth, Post_StatusController.SelectAll);
route.get(`${post_status}/selOne/:id`, auth, Post_StatusController.SelectOne);
route.post(`${post_status}/insert`, auth, Post_StatusController.Insert);
route.put(`${post_status}/update/:id`, auth, Post_StatusController.Update);
route.delete(`${post_status}/delete/:id`, auth, Post_StatusController.Delete);

const car_rent_status = "/car_rent_status";

route.get(
  `${car_rent_status}/selAll`,
  auth,
  Car_Rent_StatusController.SelectAll
);
route.get(
  `${car_rent_status}/selOne/:id`,
  auth,
  Car_Rent_StatusController.SelectOne
);
route.post(`${car_rent_status}/insert`, auth, Car_Rent_StatusController.Insert);
route.put(
  `${car_rent_status}/update/:id`,
  auth,
  Car_Rent_StatusController.Update
);
route.delete(
  `${car_rent_status}/delete/:id`,
  auth,
  Car_Rent_StatusController.Delete
);

//----------Users------------------------------------
const user = "/users";
route.get(`${user}/selAllPage`, auth, UsersController.SelectAllPage);
route.get(`${user}/selOne/:id`, auth, UsersController.SelectOne);

route.post(
  `${user}/check_username_phone_number`,

  UsersController.CheckUsernameandPhone_number
);
route.post(`${user}/refrechToken`, UsersController.RefrechToken);

route.post(`${user}/registor`, UsersController.Registor);
route.post(`${user}/login`, UsersController.Login);
route.post(`${user}/loginPhoneNumber`, UsersController.LoginPhoneNumber);

route.put(`${user}/update`, auth, UsersController.Update);
route.put(`${user}/updateProfile`, auth, UsersController.UpdateProfile);
route.put(`${user}/forgotPassword`, UsersController.ForgotPassword);
route.put(`${user}/changePassword`, auth, UsersController.ChangePassword);

route.delete(`${user}/delete/:id`, auth, UsersController.Delete);

//-----------Wallets-------------------------------------

const wallet = "/wallets";
route.get(`${wallet}/selAllPage`, auth, WalletController.SelectAllPage);
route.get(`${wallet}/selByUserId`, auth, WalletController.SelectByUserID);
route.get(
  `${wallet}/selByPromotionId/:id`,
  auth,
  WalletController.SelectByPromotionID
);
route.post(`${wallet}/insert`, auth, WalletController.Insert);
route.put(`${wallet}/update/:id`, auth, WalletController.Update);
route.delete(`${wallet}/delete/:id`, auth, WalletController.Delete);
//------------Post---------------------------------
const post = "/post";
route.get(`${post}/selAllPage`, auth, PostController.SelectAllPage);
route.get(`${post}/selOne/:id`, auth, PostController.SelectOne);
route.get(
  `${post}/selAllPageByType_of_fuals_id/:type_of_fual_id`,
  auth,
  PostController.SelectAllPageByType_of_fuals_Id
);
route.get(
  `${post}/selAllPageByCar_type_id/:car_type_id`,
  auth,
  PostController.SelectAllPageByCar_type_Id
);
route.post(`${post}/insert`, auth, PostController.Insert);
route.put(`${post}/update/:id`, auth, PostController.Update);
route.delete(`${post}/delete/:id`, auth, PostController.Delete);

//-------Update Post Rent data------------
route.put(
  `${post}/updatePost_rent_data_insert/:id`,
  auth,
  Post_rent_dataController.InsertPost_rent_data
);
route.put(
  `${post}/updatePost_rent_data_update/:id`,
  auth,
  Post_rent_dataController.UpdatePost_rent_data
);
route.put(
  `${post}/updatePost_rent_data_delete/:id`,
  auth,
  Post_rent_dataController.DeletePost_rent_data
);

//-------Update Post_doc_image data------------
route.put(
  `${post}/updatePost_doc_image_insert/:id`,
  auth,
  Post_doc_imageController.insertImage
);
route.put(
  `${post}/updatePost_doc_image_update/:id`,
  auth,
  Post_doc_imageController.updateImage
);
route.put(
  `${post}/updatePost_doc_image_delete/:id`,
  auth,
  Post_doc_imageController.deleteImage
);
//-------Update Post_doc_image data------------
route.put(
  `${post}/updatePost_driver_license_image_insert/:id`,
  auth,
  Post_driver_license_imageController.insertImage
);
route.put(
  `${post}/updatePost_driver_license_image_update/:id`,
  auth,
  Post_driver_license_imageController.updateImage
);
route.put(
  `${post}/updatePost_driver_license_image_delete/:id`,
  auth,
  Post_driver_license_imageController.deleteImage
);

//-------Update Post_car_image data------------
route.put(
  `${post}/updatePost_car_image_insert/:id`,
  auth,
  Post_car_imageController.insertImage
);
route.put(
  `${post}/updatePost_car_image_update/:id`,
  auth,
  Post_car_imageController.updateImage
);
route.put(
  `${post}/updatePost_car_image_delete/:id`,
  auth,
  Post_car_imageController.deleteImage
);
//-------Update Post_insurance_image data------------
route.put(
  `${post}/updatePost_insurance_image_insert/:id`,
  auth,
  Post_insurance_imageController.insertImage
);
route.put(
  `${post}/updatePost_insurance_image_update/:id`,
  auth,
  Post_insurance_imageController.updateImage
);
route.put(
  `${post}/updatePost_insurance_image_delete/:id`,
  auth,
  Post_insurance_imageController.deleteImage
);

//-----------Like_post---------------------------------
route.put(`${post}/like_post/:id`, auth, Like_postController.Like_post);
route.put(`${post}/unlike_post/:id`, auth, Like_postController.UnLike_post);

//--------------Labels_post_data------------------------------------
route.put(`${post}/labels_post_add`, auth, Labels_DataController.Insert);
route.put(`${post}/labels_post_remove/:id`, auth, Labels_DataController.Delete);

route.get(
  `${post}/labels_post/:id`,
  auth,
  Labels_DataController.SelectByPostID
);

//-------Review------------------------------------------------
const review = "/reviews";
route.get(`${review}/selByPostId/:id`, auth, ReviewController.SelectByPostId);

route.post(`${review}/insert`, auth, ReviewController.Insert);

route.delete(`${review}/delete/:id`, auth, ReviewController.Delete);

//----------Car_rent--------------------------------------------------
const car_rent = "/car_rent";
route.get(`${car_rent}/selOne/:id`, auth, Car_rentController.SelectOne);
route.get(`${car_rent}/selAllPage`, auth, Car_rentController.SelectAllPage);
route.get(
  `${car_rent}/selAllPageByPost/:id`,
  auth,
  Car_rentController.SelectAllPageByPost_id
);
route.get(
  `${car_rent}/selAllPageByUser/:id`,
  auth,
  Car_rentController.SelectAllPageByUser_id
);
route.post(
  `${car_rent}/selAllPageUser_status`,
  auth,
  Car_rentController.SelectAllPageByUser_idandStatus_id
);
route.get(
  `${car_rent}/selAllPagePay_status`,
  auth,
  Car_rentController.SelectAllPagePay_status
);

route.post(`${car_rent}/insert`, auth, Car_rentController.Insert);

route.put(`${car_rent}/update/:id`, auth, Car_rentController.Update);
route.put(
  `${car_rent}/update_visa/:id`,
  auth,
  Car_rentController.UpdateCar_rent_visa
);
route.put(
  `${car_rent}/updatedoc_image/:id`,
  auth,
  Car_rentController.UpdateDoc_image
);
route.put(
  `${car_rent}/updatePayment_image/:id`,
  auth,
  Car_rentController.UpdatePayment_image
);
route.put(
  `${car_rent}/updatePayment_status/:id`,
  auth,
  Car_rentController.UpdatePayment_status
);

route.delete(`${car_rent}/delete/:id`, auth, Car_rentController.Delete);
//-----Location-----------------------------
const location = "/location";
route.get(`${location}/selByUser`, auth, LocationController.SelectByUser);
route.post(`${location}/insert`, auth, LocationController.Insert);
route.put(`${location}/update/:id`, auth, LocationController.Update);
route.delete(`${location}/delete/:id`, auth, LocationController.Delete);
export default route;
