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
const route = express.Router();

//-----------Promotion-------------------------
const promotion = "/promotion";
route.get(`${promotion}/selOne/:id`, PromotionController.SelecOne);
route.get(`${promotion}/selAll`, PromotionController.SelectAll);
route.get(`${promotion}/selIsPublic`, PromotionController.SelectIsPublic);
route.get(`${promotion}/selAllpages`, PromotionController.SelectPage);

route.post(`${promotion}/insert`, PromotionController.Insert);

route.delete(`${promotion}/delete/:id`, PromotionController.Delete);

route.put(`${promotion}/update/:id`, PromotionController.Update);

//-----------Banner--------------------------------------
const banners = "/banner";
route.get(`${banners}/selAll`, BannerController.SelectAll);
route.get(`${banners}/selIsPublic`, BannerController.SelectIsPublic);

route.post(`${banners}/insert`, BannerController.Insert);

route.put(`${banners}/update/:id`, BannerController.Update);
route.delete(`${banners}/delete/:id`, BannerController.Delete);

//---------------Car_brands-------------------------------------
const car_brands = `/car_brands`;
route.get(`${car_brands}/selAll`, Car_BrandsController.SelectAll);
route.get(`${car_brands}/selOne/:id`, Car_BrandsController.SelectOne);

route.post(`${car_brands}/insert`, Car_BrandsController.Insert);

route.put(`${car_brands}/update/:id`, Car_BrandsController.Update);
route.put(`${car_brands}/updateIcon/:id`, Car_BrandsController.UpdateIcon);

route.delete(`${car_brands}/delete/:id`, Car_BrandsController.Delete);

//-----------------------Car_type-----------------------------------------
const car_types = `/car_types`;
route.get(`${car_types}/selAll`, Car_typesController.SelectAll);
route.get(`${car_types}/selOne/:id`, Car_typesController.SelectOne);

route.post(`${car_types}/insert`, Car_typesController.Insert);

route.put(`${car_types}/update/:id`, Car_typesController.Update);
route.put(`${car_types}/updateIcon/:id`, Car_typesController.UpdateIcon);
route.delete(`${car_types}/delete/:id`, Car_typesController.Delete);

//---------Insurance_companys-------------------------------------------------------

const insurance_companies = `/insurance_companies`;
route.get(
  `${insurance_companies}/selAll`,
  Insurance_companysController.SelectAll
);
route.get(
  `${insurance_companies}/selOne/:id`,
  Insurance_companysController.SelectOne
);
route.post(
  `${insurance_companies}/insert`,
  Insurance_companysController.Insert
);
route.put(
  `${insurance_companies}/update/:id`,
  Insurance_companysController.Update
);
route.put(
  `${insurance_companies}/updateIcon/:id`,
  Insurance_companysController.UpdateIcon
);
route.delete(
  `${insurance_companies}/delete/:id`,
  Insurance_companysController.Delete
);

//-----------Labels-----------------------------------------------------
const labels = `/labels`;
route.get(`${labels}/selAll`, LabelsController.SelectAll);
route.get(`${labels}/selOne/:id`, LabelsController.SelectOne);

route.post(`${labels}/insert`, LabelsController.Insert);

route.put(`${labels}/update/:id`, LabelsController.Update);
route.put(`${labels}/updateIcon/:id`, LabelsController.UpdateIcon);

route.delete(`${labels}/delete/:id`, LabelsController.Delete);

//-----------Type_of_fuals-----------------------------------------------------
const type_of_fuals = `/type_of_fuals`;
route.get(`${type_of_fuals}/selAll`, Type_of_FualsController.SelectAll);
route.get(`${type_of_fuals}/selOne/:id`, Type_of_FualsController.SelectOne);

route.post(`${type_of_fuals}/insert`, Type_of_FualsController.Insert);

route.put(`${type_of_fuals}/update/:id`, Type_of_FualsController.Update);
route.put(
  `${type_of_fuals}/updateIcon/:id`,
  Type_of_FualsController.UpdateIcon
);

route.delete(`${type_of_fuals}/delete/:id`, Type_of_FualsController.Delete);

//----------Level_Insurance----------------------------------------------------------
const level_insurances = "/level_insurances";

route.get(`${level_insurances}/selAll`, Level_InsurancesController.SelectAll);
route.get(
  `${level_insurances}/selOne/:id`,
  Level_InsurancesController.SelectOne
);
route.post(`${level_insurances}/insert`, Level_InsurancesController.Insert);
route.put(`${level_insurances}/update/:id`, Level_InsurancesController.Update);
route.delete(
  `${level_insurances}/delete/:id`,
  Level_InsurancesController.Delete
);

//----------Level_Insurance----------------------------------------------------------
const post_status = "/post_status";

route.get(`${post_status}/selAll`, Post_StatusController.SelectAll);
route.get(`${post_status}/selOne/:id`, Post_StatusController.SelectOne);
route.post(`${post_status}/insert`, Post_StatusController.Insert);
route.put(`${post_status}/update/:id`, Post_StatusController.Update);
route.delete(`${post_status}/delete/:id`, Post_StatusController.Delete);

const car_rent_status = "/car_rent_status";

route.get(`${car_rent_status}/selAll`, Car_Rent_StatusController.SelectAll);
route.get(`${car_rent_status}/selOne/:id`, Car_Rent_StatusController.SelectOne);
route.post(`${car_rent_status}/insert`, Car_Rent_StatusController.Insert);
route.put(`${car_rent_status}/update/:id`, Car_Rent_StatusController.Update);
route.delete(`${car_rent_status}/delete/:id`, Car_Rent_StatusController.Delete);

//----------Users------------------------------------
const user = "/users";
route.get(`${user}/selAllPage`, UsersController.SelectAllPage);
route.get(`${user}/selOne/:id`, UsersController.SelectOne);

route.post(`${user}/refrechToken`, UsersController.RefrechToken);
route.post(`${user}/registor`, UsersController.Registor);
route.post(`${user}/login`, UsersController.Login);
route.post(`${user}/loginPhoneNumber`, UsersController.LoginPhoneNumber);

route.put(`${user}/update/:id`, UsersController.Update);
route.put(`${user}/updateProfile/:id`, UsersController.UpdateProfile);
route.put(`${user}/forgotPassword`, UsersController.ForgotPassword);
route.put(`${user}/changePassword/:id`, UsersController.ChangePassword);

route.delete(`${user}/delete/:id`, UsersController.Delete);

//-----------Wallets-------------------------------------

const wallet = "/wallets";
route.get(`${wallet}/selAllPage`, WalletController.SelectAllPage);
route.get(`${wallet}/selByUserId/:id`, WalletController.SelectByUserID);
route.get(
  `${wallet}/selByPromotionId/:id`,
  WalletController.SelectByPromotionID
);
route.post(`${wallet}/insert`, WalletController.Insert);
route.put(`${wallet}/update/:id`, WalletController.Update);
route.delete(`${wallet}/delete/:id`, WalletController.Delete);
//------------Post---------------------------------
const post = "/post";
route.post(`${post}/insert`, PostController.Insert);
route.get(`${post}/selAllPage`, PostController.SelectAllPage);
export default route;
