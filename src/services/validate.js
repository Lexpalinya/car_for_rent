export const DataExists = (data) => {
  const obj = {};
  Object.keys(data).forEach((key) => {
    obj[key] = data[key];
  });
  return obj;
};

export const ValidateData = (data) => {
  return Object.keys(data).filter((key) => !data[key]);
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

//---------------User----------------------------

export const ValidateUserRegistor = (data) => {
  const { username, email, password, phone_number } = data;
  return ValidateData({ username, email, password, phone_number });
};

export const ValidateLogin = (data) => {
  const { username, password } = data;
  return ValidateData({ username, password });
};
export const ValidateLoginPhoneNumber = (data) => {
  const { phone_number, password } = data;
  return ValidateData({ phone_number, password });
};

export const ValidateChangePassword = (data) => {
  const { new_password, old_password } = data;
  return ValidateData({ new_password, old_password });
};

export const ValidateForgotPassword = (data) => {
  const { phone_number, new_password } = data;
  return ValidateData({ phone_number, new_password });
};

//-----------------------------------------
export const ValidateWallet = (data) => {
  const { user_id, promotion_id } = data;
  return ValidateData({ user_id, promotion_id });
};
