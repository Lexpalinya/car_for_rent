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
  const { name, detail, wheel } = data;
  return ValidateData({ name, detail, wheel });
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
  const { username, password, phone_number } = data;
  return ValidateData({ username, password, phone_number });
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
export const ValidateCheckUsernameAndPhone_number = (data) => {
  const { username, phone_number } = data;
  return ValidateData({ username, phone_number });
};

//--------Post---------------------------------

export const ValidatePost = (data) => {
  const {
    car_type_id,
    frist_name,
    last_name,
    birth_day,
    nationnality,
    doc_type,
    car_insurance,
    car_brand,
    car_version,
    car_year,
    car_resgistration,
    door,
    type_of_fual_id,
    driver_system,
    seat,
    car_color,
    description,
    street,
    point,
    address,
    detail_address,
    deposits_fee,
    status_id,
    //
    post_rent_data,
  } = data;
  return ValidateData({
    car_type_id,
    frist_name,
    last_name,
    birth_day: new Date(birth_day).toString(),
    nationnality,
    doc_type,
    car_insurance,
    car_brand,
    car_version,
    car_year,
    car_resgistration,
    door,
    type_of_fual_id,
    driver_system,
    seat,
    car_color,
    description,
    street,
    point,
    address,
    detail_address,
    deposits_fee,
    status_id,
    //
    post_rent_data,
  });
};

export const ValidatePost_rent_data = (data) => {
  let { title, price, deposit, system_cost, total } = data;
  return ValidateData({ title, price, deposit, system_cost, total });
};

export const ValidatePost_rent_dataUpdate = (data) => {
  let { id, title, price, deposit, system_cost, total } = data;
  return ValidateData({ id, title, price, deposit, system_cost, total });
};

export const ValidateLabels_data = (data) => {
  const { post_id, label_id } = data;
  return ValidateData({ post_id, label_id });
};

export const ValidateReveiw = (data) => {
  const { post_id, star, comment } = data;
  return ValidateData({ post_id, star, comment });
};

export const ValidateCar_rent = (data) => {
  const {
    post_id,
    start_date,
    end_date,
    frist_name,
    last_name,
    email,
    phone_number,
    doc_type,
    booking_fee,
    pay_destination,
    pay_type,
    bank_no,
    // pay_status,
    status_id,
  } = data;
  return ValidateData({
    post_id,
    start_date,
    end_date,
    frist_name,
    last_name,
    email,
    phone_number,
    doc_type,
    booking_fee,
    pay_destination,
    pay_type,
    bank_no,
    // pay_status,
    status_id,
  });
};

export const ValidateLocation = (data) => {
  const { tag, street, point, address, detail } = data;
  return ValidateData({
    tag,
    street,
    point,
    address,
    detail,
  });
};
