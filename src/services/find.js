import prisma from "../utils/prisma.client";
import { CachDataFindById, CachDataFindByIdNoClear } from "./cach.contro";

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
    { id: true }
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

// export const FindPromotionById = (id) => {
//   return findUnique("promotions", id, select);
// };
