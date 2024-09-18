import prisma from "../utils/prisma.client";
import {
  CachDataAll,
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
      profile: true,
      first_name: true,
      last_name: true,
      fackbook_id: true,
      google_id: true,
      kyc: true,
      blacklist: true,
      device_token: true,
      login_version: true,
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
      blacklist: true,
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
      blacklist: true,
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
      blacklist: true,
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
      blacklist: true,
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
export const CheckCar_registation = ({
  car_resgistration,
  province_vehicle,
}) => {
  return CachDataAll("posts"+car_resgistration+province_vehicle, "posts", {
    is_active: true,
    car_resgistration,
    province_vehicle,
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
      car_insurance: true,
      insurance_company_id: true,
      level_insurance_id: true,
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
      mutjum: true,
      pubmai: true,
      status_id: true,
      created_at: true,
      updated_at: true,
      insurance_company: true,
      level_insurance: true,
      type_of_fual: true,
      status: true,
      users: {
        select: {
          username: true,
          phone_number: true,
          profile: true,
          kycs: true,
        },
      },
      car_types: true,
      post_doc_image: true,
      post_car_image: true,
      // post_driver_license_image: true,
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
      is_active: true,
      user_id: true,
      post_id: true,
      type_rent: true,
      price_rent: true,
      start_date: true,
      end_date: true,
      frist_name: true,
      last_name: true,
      village: true,
      district: true,
      province: true,
      phone_number: true,
      email: true,
      doc_type: true,
      description: true,
      promotion_id: true,
      discount: true,
      total_price: true,
      booking_fee: true,
      tax: true,
      pay_destination: true,
      khampakan: true,
      pay_type: true,
      bank_no: true,
      pay_status: true,
      reason: true,
      status_id: true,
      is_success: true,
      created_at: true,
      updated_at: true,
      post: {
        select: {
          star: true,
          users: {
            select: {
              profile: true,
              kycs: {
                select: {
                  first_name: true,
                  last_name: true,
                  village: true,
                  district: true,
                  province: true,
                  phone_number: true,
                },
              },
            },
          },
    
          car_types: true,
    
          car_version: true,
          car_year: true,
          post_car_image: {
            select: {
              url: true,
            },
          },
        },
      },
      status: true,
      promotion: true,
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

export const FindKycById = (id) => {
  return CachDataFindDataId_One(
    id + "kycs",
    "kycs",
    {
      is_active: true,
      id,
    },
    {
      id: true,
      is_active: true,
      status: true,
      user_type: true,
      first_name: true,
      last_name: true,
      birthday: true,
      nationality: true,
      doc_type: true,
      user_id: true,
      created_at: true,
      updated_at: true,
      kyc_doc_image: true,
    }
  );
};
