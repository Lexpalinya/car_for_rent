import prisma from "../utils/prisma.client";
import {
  CachDataFindById,
  CachDataFindByIdNoClear,
  CachDataFindDataId_One,
  CachDataFindUserNoClear,
} from "./cach.contro";

const findUnique = (model, id, select) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await prisma[model].findUnique({
        where: {
          id,
          is_active: true,
        },
        select,
      });
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

//--------cach no clear-----------------------------------------------------------------------
export const FindBannerById = (id) => {
  return CachDataFindByIdNoClear("banners", "banners", { id, is_active: true });
};

export const FindPromotionById_ID = (id) => {
  return CachDataFindByIdNoClear(
    "promotions-id",
    "promotions",
    { id, is_active: true },
    { id: true, amount: true, count_use: true }
  );
};

//-----------------Post-----------------------------
export const FindPost_StatusById = (id) => {
  return CachDataFindByIdNoClear("post_status", "post_status", {
    id,
    is_active: true,
  });
};

//-------------------Car_rent----------------------------
export const FindCar_Rent_StatusById = (id) => {
  return CachDataFindByIdNoClear("car_rent_status", "car_rent_status", {
    id,
    is_active: true,
  });
};

export const FindLevel_InsurancesById = (id) => {
  return CachDataFindByIdNoClear("level_insurances", "level_insurances", {
    id,
    is_active: true,
  });
};
export const FindType_of_FualsById = (id) => {
  return CachDataFindByIdNoClear("type_of_fuals", "type_of_fuals", {
    id,
    is_active: true,
  });
};

export const FindCar_typesById = (id) => {
  return CachDataFindByIdNoClear("car_types", "car_types", {
    id,
    is_active: true,
  });
};
export const FindLablesById = (id) => {
  return CachDataFindByIdNoClear("labels", "labels", {
    id,
    is_active: true,
  });
};
export const FindCar_BrandsById = (id) => {
  return CachDataFindByIdNoClear("car_brands", "car_brands", {
    id,
    is_active: true,
  });
};

export const FindInsurance_CompanysById = (id) => {
  return CachDataFindByIdNoClear("insurance_companies", "insurance_companies", {
    id,
    is_active: true,
  });
};

//--------------------User----------------------------------
export const FindUserById = (id) => {
  return CachDataFindById(
    id + "users",
    "users",
    {
      id,
      is_active: true,
    },
    {
      id: true,
      is_active: true,
      username: true,
      email: true,
      phone_number: true,
      // password: true,
      profile: true,
      // fackbook_id: true,
      // google_id: true,
      // device_token: true,
      login_version: true,
      role: true,
      created_at: true,
      updated_at: true,
    }
  );
};

export const FindUserById_ID = (id) => {
  // console.log("idfaf :>> ", id);
  return CachDataFindByIdNoClear(
    "ID_user",
    "users",
    {
      id,
      is_active: true,
    },
    {
      id: true,
      username: true,
      email: true,
      phone_number: true,
      password: true,
      login_version: true,
      role: true,
    }
  );
};

//--------------
export const FindUserUserNameAlready = (username) => {
  return CachDataFindUserNoClear(
    "ID_user",
    "users",
    {
      username,
      is_active: true,
    },
    {
      id: true,
      username: true,
      email: true,
      phone_number: true,
      password: true,
      login_version: true,
      role: true,
    },
    "username"
  );
};
export const FindUserEmailAlready = (email) => {
  return CachDataFindUserNoClear(
    "ID_user",
    "users",
    {
      email,
      is_active: true,
    },
    {
      id: true,
      username: true,
      email: true,
      phone_number: true,
      password: true,
      login_version: true,
      role: true,
    },
    "email"
  );
};

export const FindUserPhone_NumberAlready = (phone_number) => {
  return CachDataFindUserNoClear(
    "ID_user",
    "users",
    {
      phone_number,
      is_active: true,
    },
    {
      id: true,
      username: true,
      email: true,
      phone_number: true,
      password: true,
      login_version: true,
      role: true,
    },
    "phone_number"
  );
};
// export const FindPromotionById = (id) => {
//   return findUnique("promotions", id, select);
// };

//----------------Wallet-------------------------------
export const FindWalletById = (id) => {
  return CachDataFindById("wallets", "wallet", {
    id,
    is_active: true,
  });
};

//--------------Post--------------------------
export const FindPostById_for_edit = (id) => {
  return CachDataFindDataId_One(id + "posts-edit", "posts", {
    id,
    is_active: true,
  });
};

export const FindPostById = (id) => {
  return CachDataFindDataId_One(
    id + "posts",
    "posts",
    { id, is_active: true },
    {
      id: true,
      is_active: true,
      car_type_id: true,
      user_id: true,
      star: true,
      frist_name: true,
      last_name: true,
      birth_day: true,
      nationnality: true,
      doc_type: true,
      car_insurance: true,
      insurance_company_id: true,
      level_insurance_id: true,
      car_brand_id: true,
      car_brand: true,
      car_version: true,
      car_year: true,
      car_resgistration: true,
      door: true,
      type_of_fual_id: true,
      driver_system: true,
      seat: true,
      car_color: true,
      description: true,
      street: true,
      point: true,
      village: true,
      district: true,
      province: true,
      user_type: true,
      mutjum: true,
      deposits_fee: true,
      status_id: true,
      created_at: true,
      updated_at: true,
      insurance_company: true,
      level_insurance: true,
      car_brands: true,
      type_of_fual: true,
      status: true,
      users: {
        select: {
          username: true,
          phone_number: true,
        },
      },
      post_doc_image: true,
      post_car_image: true,
      post_driver_license_image: true,
      post_insurance_image: true,
      post_rent_data: true,
      like_post: {
        select: {
          user_id: true,
        },
      },
    }
  );
};

export const FindReviewById_ID = (id) => {
  return CachDataFindDataId_One(id + "reviews", "review", {
    id,
    is_active: true,
  });
};

export const FindCar_rentById_for_edit = (id) => {
  return CachDataFindDataId_One(id + "car_rent-edit", "car_rent", {
    id,
    is_active: true,
  });
};

export const FindCar_rentById = (id) => {
  return CachDataFindDataId_One(
    id + "car_rent",
    "car_rent",
    {
      id,
      is_active: true,
    },
    {
      id: true,
      post_id: true,
      user_id: true,
      start_date: true,
      end_date: true,
      frist_name: true,
      last_name: true,
      email: true,
      phone_number: true,
      doc_type: true,
      booking_fee: true,
      pay_destination: true,
      description: true,
      reason: true,
      promotion_id: true,
      post: {
        select: {
          star: true,
          car_brands: {
            select: {
              name: true,
            },
          },
          car_version: true,
          car_year: true,
          post_car_image: {
            select: {
              url: true,
            },
          },
        },
      },
      car_rent_doc_image: true,
      car_rent_driving_lincense_image: true,
      car_rent_payment_image: true,
      car_rent_visa: true,
    }
  );
};

export const FindLocationById = (id) => {
  return findUnique("location", id);
};
