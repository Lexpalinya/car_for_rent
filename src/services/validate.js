export const DataExists = (data) => {
  const obj = {};
  Object.keys(data).forEach((key) => {
    obj[key] = data[key];
  });
  return obj;
};

export const ValidateData = (data) => {
  return Object.keys(data).forEach((key) => !data[key]);
};
//----------Promotion-----------------------------
export const ValidatePromotion = (data) => {
  const { price, amount } = data;
  return ValidateData({ price, amount });
};

//------------post_status----------------------
export const ValidatePost_Status = (data) => {
  const { name } = data;
  return ValidateData({ name });
};

//----------------------------------------------
export const ValidateCar_Types = (data) => {
  const { name, detail } = data;
  return ValidateData({ name, detail });
};

export const ValidateLabels = (data) => {
  const { name } = data;
  return ValidateData({ name });
};
export const ValidateCar_Brands = (data) => {
  const { name } = data;
  return ValidateData({ name });
};
export const ValidateLevel_Insurances = (data) => {
  const { name } = data;
  return ValidateData({ name });
};
export const ValidateInsurances_Companies = (data) => {
  const { name } = data;
  return ValidateData({ name });
};

export const ValidateType_of_Fuals = (data) => {
  const { name } = data;
  return ValidateData({ name });
};

//----------rent_status---------------------------------
export const ValidateCar_Rent_Status = (data) => {
  const { name } = data;
  return ValidateData({ name });
};
