import express from "express";
import PromotionController from "../controllers/promotion.controller";

import Car_BrandsController from "../controllers/car_brands.controller";
import Car_typesController from "../controllers/car_types.controller";
import Insurance_companysController from "../controllers/insurance_companies.controller";
import Level_InsurancesController from "../controllers/level_insurance.controller";
import Type_of_FualsController from "../controllers/type_of_fuals.controller";

import UsersController from "../controllers/user.controller";
import WalletController from "../controllers/wallet.controller";

import Like_postController from "../controllers/post/like_post.controller";
import ReviewController from "../controllers/post/review.controller";

import LocationController from "../controllers/location.controller";
import { admin, auth } from "../middleware/auth";
import {
  Post_car_imageController,
  Post_doc_imageController,
  Post_driver_license_imageController,
  Post_insurance_imageController,
} from "../controllers/post/post_image.controller";
import KycController from "../controllers/kyc.controller";
import Kyc_doc_imageController from "../controllers/kyc_doc_image.controller";
import ExchagneRateController from "../controllers/exchange_rate.controller";
import Post_StatusController from "../controllers/post/post_status.controller";
import Car_Rent_StatusController from "../controllers/car_rent/rent_status.controller";
import PostController from "../controllers/post/post.controller";
import Post_rent_dataController from "../controllers/post/post_rent_dataController";
import Car_rentController from "../controllers/car_rent/car_rent.controller";
import BannerController from "../controllers/banner.controller";
import NotificationController from "../controllers/notification.controller";
import Payment_qrController from "../controllers/payment_qr.controller";
import NewsController from "../controllers/new.controller";
import Popular_PlacesController from "../controllers/popular_places.controller";
const route = express.Router();

//-----------Promotion-------------------------
const promotion = "/promotion";
route.get(`${promotion}/selOne/:id`, auth, PromotionController.SelecOne);
// route.get(`${promotion}/selAll`, auth, admin, PromotionController.SelectAll);
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

//---------------News-------------------------------------------
const news = "/news";
route.get(`${news}/selAll`, auth, admin, NewsController.SelectAll);
route.get(`${news}/selIsPublic`, auth, NewsController.SelectIsPublic);

route.post(`${news}/insert`, auth, admin, NewsController.Insert);

route.put(`${news}/update/:id`, auth, admin, NewsController.Update);
route.put(
  `${news}/updateIsPublic/:id`,
  auth,
  admin,
  NewsController.Update_Is_public
);
route.delete(`${news}/delete/:id`, auth, admin, NewsController.Delete);
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

//---------------Car_brands-------------------------------------
const payment_qr = `/payment_qr`;
route.get(`${payment_qr}/selAll`, auth, Payment_qrController.SelectAll);
route.get(`${payment_qr}/selOne/:id`, auth, Payment_qrController.SelectOne);

route.post(`${payment_qr}/insert`, auth, Payment_qrController.Insert);

route.put(`${payment_qr}/update/:id`, auth, Payment_qrController.Update);
route.put(`${payment_qr}/updateIcon/:id`, auth, Payment_qrController.UpdateQr);

route.delete(`${payment_qr}/delete/:id`, auth, Payment_qrController.Delete);

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

// //-----------Labels-----------------------------------------------------
// const labels = `/labels`;
// route.get(`${labels}/selAll`, auth, LabelsController.SelectAll);
// route.get(`${labels}/selOne/:id`, auth, LabelsController.SelectOne);

// route.post(`${labels}/insert`, auth, LabelsController.Insert);

// route.put(`${labels}/update/:id`, auth, LabelsController.Update);
// route.put(`${labels}/updateIcon/:id`, auth, LabelsController.UpdateIcon);

// route.delete(`${labels}/delete/:id`, auth, LabelsController.Delete);

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
route.get(
  `${post_status}/selForShowCarData`,
  auth,
  Post_StatusController.SelectForshowCarData
);
route.get(
  `${post_status}/selForshowFollow`,
  auth,
  Post_StatusController.SelectForshowFollow
);
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
  `${car_rent_status}/selShowUserRent`,
  auth,
  Car_Rent_StatusController.SelectShowUserRent
);
route.get(
  `${car_rent_status}/selShowUserPost`,
  auth,
  Car_Rent_StatusController.SelectShowUserPost
);
route.get(
  `${car_rent_status}/selShowHistory`,
  auth,
  Car_Rent_StatusController.SelectShowHistory
);
route.get(
  `${car_rent_status}/selOne/:id`,
  auth,

  Car_Rent_StatusController.SelectOne
);
route.post(
  `${car_rent_status}/insert`,
  auth,
  admin,
  Car_Rent_StatusController.Insert
);
route.put(
  `${car_rent_status}/update/:id`,
  auth,
  admin,
  Car_Rent_StatusController.Update
);
route.delete(
  `${car_rent_status}/delete/:id`,
  auth,
  admin,
  Car_Rent_StatusController.Delete
);

//----------Users------------------------------------
const user = "/users";
route.get(`${user}/selAllPage`, auth, admin, UsersController.SelectAllPage);
route.get(`${user}/selOne`, auth, UsersController.SelectOne);
route.get(`${user}/count`, auth, admin, UsersController.CountUser);

route.post(
  `${user}/check_username_phone_number`,

  UsersController.CheckUsernameandPhone_number
);
route.post(`${user}/refrechToken`, UsersController.RefrechToken);

route.post(`${user}/registor`, UsersController.Registor);
route.post(`${user}/login`, UsersController.Login);
route.post(`${user}/loginEmail`, UsersController.LoginEmail);
route.post(`${user}/loginPhoneNumber`, UsersController.LoginPhoneNumber);
route.post(
  `${user}/googleSignInandSingUp`,
  UsersController.GoogleSignInAndSignUp
);

route.put(`${user}/update`, auth, UsersController.Update);
route.put(`${user}/updateProfile`, auth, UsersController.UpdateProfile);
route.put(`${user}/forgotPassword`, UsersController.ForgotPassword);
route.put(`${user}/changePassword`, auth, UsersController.ChangePassword);

route.delete(`${user}/delete`, auth, UsersController.Delete);

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
route.get(`${post}/selAllDiscount`, auth, PostController.SelectAllDiscount);
route.get(`${post}/selPopular`, auth, PostController.SelectPopular);
route.get(
  `${post}/selAllAdminPage`,
  auth,
  admin,
  PostController.SelectAllAdminPage
);
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
route.get(
  `${post}/selByPost_statu/:id`,
  auth,
  PostController.SelectAllByPost_Status
);
route.get(`${post}/search`, auth, PostController.Search);

route.get(`${post}/selAllByUser`, auth, PostController.SelectAllByUser);

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
const like_post = "/like_post";
route.get(`${like_post}/selByUser`, auth, Like_postController.SelectByUser);
route.get(`${like_post}/selByPost/:id`, auth, Like_postController.SelectByPost);

// //--------------Labels_post_data------------------------------------
// route.put(`${post}/labels_post_add`, auth, Labels_DataController.Insert);
// route.put(`${post}/labels_post_remove/:id`, auth, Labels_DataController.Delete);

// route.get(
//   `${post}/labels_post/:id`,
//   auth,
//   Labels_DataController.SelectByPostID
// );

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
  `${car_rent}/selAllByUser`,
  auth,
  Car_rentController.SelectAllByUser_id
);
route.get(
  `${car_rent}/selAllByUserHistory`,
  auth,
  Car_rentController.SelectAllByUser_idHistory
);
route.get(
  `${car_rent}/selAllPagePay_status`,
  auth,
  Car_rentController.SelectAllPagePay_status
);

route.get(
  `${car_rent}/selAllByUserPost`,
  auth,
  Car_rentController.SelectByUserPost
);
route.get(
  `${car_rent}/selAllByUserPostHistory`,
  Car_rentController.SelectByUserPostHistory
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
  admin,
  Car_rentController.UpdatePayment_status
);
route.put(
  `${car_rent}/updatePayment_statusCancle/:id`,
  auth,
  admin,
  Car_rentController.UpdatePayment_statusCancel
);
route.put(
  `${car_rent}/updateDriving_lincense_image/:id`,
  Car_rentController.UpdateCar_rent_driving_lincense_image
);

route.put(
  `${car_rent}/updatestatus/:id`,
  auth,
  Car_rentController.UpdateStatus
);
route.put(
  `${car_rent}/updatestatusAdmin/:id`,
  auth,
  Car_rentController.UpdateStatusAdmin
);

route.put(
  `${car_rent}/UpdateStatusApproval/:id`,
  auth,
  Car_rentController.UpdateStatusApproval
);
route.put(
  `${car_rent}/UpdateStatusCancel/:id`,
  auth,
  Car_rentController.UpdateStatusCancel
);
route.put(
  `${car_rent}/UpdateStatusSuccess/:id`,
  auth,
  Car_rentController.UpdateStatusSuccess
);

route.delete(`${car_rent}/delete/:id`, auth, Car_rentController.Delete);
//-----Location-----------------------------
const location = "/location";
route.get(`${location}/selByUser`, auth, LocationController.SelectByUser);
route.post(`${location}/insert`, auth, LocationController.Insert);
route.put(`${location}/update/:id`, auth, LocationController.Update);
route.delete(`${location}/delete/:id`, auth, LocationController.Delete);
export default route;

//--------Kyc----------------------------------
const kyc = `/kyc`;
route.get(`${kyc}/selAll`, auth, admin, KycController.SelectAll);
route.get(`${kyc}/selByUser/:id`, auth, KycController.SelectByUserID);
route.get(`${kyc}/selByStatus`, auth, admin, KycController.SelectByStatus);
route.get(`${kyc}/selOne/:id`, auth, KycController.SelectOne);

route.post(`${kyc}/insert`, auth, KycController.Insert);

route.put(`${kyc}/update/:id`, auth, KycController.Update);
route.put(`${kyc}/updateStatus/:id`, auth, admin, KycController.UpdateStatus);

route.delete(`${kyc}/delete/:id`, auth, KycController.Delete);

//-----------Kyc_doc_image------------------------------------

route.put(`${kyc}/doc_image_insert/:id`, auth, Kyc_doc_imageController.Insert);
route.put(`${kyc}/doc_image_update/:id`, auth, Kyc_doc_imageController.Update);
route.put(`${kyc}/doc_image_delete/:id`, auth, Kyc_doc_imageController.Delete);

//-----------exchange_rate-----------------------------------------------------
const exchange_rate = `/exchange_rate`;
route.get(`${exchange_rate}/selAll`, auth, ExchagneRateController.SelectAll);
route.get(
  `${exchange_rate}/selOne/:id`,
  auth,
  ExchagneRateController.SelectOne
);

route.post(
  `${exchange_rate}/insert`,
  auth,
  admin,
  ExchagneRateController.Insert
);

route.put(
  `${exchange_rate}/update/:id`,
  auth,
  admin,
  ExchagneRateController.Update
);
route.put(
  `${exchange_rate}/updateIcon/:id`,
  auth,
  admin,
  ExchagneRateController.UpdateIcon
);

route.delete(
  `${exchange_rate}/delete/:id`,
  auth,
  admin,
  ExchagneRateController.Delete
);
//------------Notification-------------------------------
const noti = "/noti";
route.get(
  `${noti}/selByUser`,
  auth,
  NotificationController.SelectNotiByUser_id
);
route.get(`${noti}/selOne/:id`, auth, NotificationController.SelectOne);
route.get(`${noti}/selByAdmin`, auth, NotificationController.SelectByAdmin);

route.post(
  `${noti}/seveDevice_token`,
  auth,
  NotificationController.saveRegisterToken
);

route.put(`${noti}/readNoti/:id`, auth, NotificationController.readNoti);
//--------------popular_places-------------------------------
const popular_places = "/popular_places";
route.get(
  `${popular_places}/selAllPage`,
  auth,
  Popular_PlacesController.SelectAllPages
);
route.get(
  `${popular_places}/selOne/:id`,
  auth,
  Popular_PlacesController.SelectOne
);
route.post(`${popular_places}/insert`, auth, Popular_PlacesController.Insert);

route.put(
  `${popular_places}/update/:id`,
  auth,
  Popular_PlacesController.Update
);

route.put(
  `${popular_places}/updateImages_Add/:id`,
  auth,
  Popular_PlacesController.UpdateImages_Add_image
);
route.put(
  `${popular_places}/updateImages_Update/:id`,
  auth,
  Popular_PlacesController.UpdateImages_Update_image
);
route.put(
  `${popular_places}/updateImages_Delete/:id`,
  auth,
  Popular_PlacesController.UpdateImages_Delete_image
);

route.put(
  `${popular_places}/updateCoverImage/:id`,
  auth,
  Popular_PlacesController.UpdateCoverImage
);

route.delete(
  `${popular_places}/delete/:id`,
  auth,
  Popular_PlacesController.Delete
);
