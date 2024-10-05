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
  const { title, price, amount, out_date } = data;
  return ValidateData({
    title,
    price,
    amount,
    out_date,
  });
};

//------------post_status----------------------
export const ValidatePost_Status = (data) => {
  const { nameLao, nameEng, nameChi, nameRok, priority } = data;
  return ValidateData({ nameLao, nameEng, nameChi, nameRok, priority });
};

//----------------------------------------------
export const ValidateCar_Types = (data) => {
  const { nameLao, nameEng, nameChi, nameRok, detail, wheel, commition } = data;
  return ValidateData({
    nameLao,
    nameEng,
    nameChi,
    nameRok,
    detail,
    wheel,
    commition,
  });
};

export const ValidateLabels = (data) => {
  const { name } = data;
  return ValidateData({ name });
};
export const ValidateCar_Brands = (data) => {
  const { name } = data;
  return ValidateData({ name });
};
export const ValidatePayment_qr = (data) => {
  const { currency } = data;
  return ValidateData({ currency });
};
export const ValidateExchange_rate = (data) => {
  const { currency, sell, buy } = data;
  return ValidateData({ currency, sell, buy });
};
export const ValidateLevel_Insurances = (data) => {
  const { nameLao, nameEng, nameChi, nameRok } = data;
  return ValidateData({ nameLao, nameEng, nameChi, nameRok });
};
export const ValidateInsurances_Companies = (data) => {
  const { name } = data;
  return ValidateData({ name });
};

export const ValidateType_of_Fuals = (data) => {
  const { nameLao, nameEng, nameChi, nameRok, wheel } = data;
  return ValidateData({ nameLao, nameEng, nameChi, nameRok, wheel });
};

//----------rent_status---------------------------------
export const ValidateCar_Rent_Status = (data) => {
  const {
    nameTenantLao,
    nameTenantEng,
    nameTenantChi,
    nameTenantRok,
    priority,
  } = data;
  return ValidateData({
    nameTenantLao,
    nameTenantEng,
    nameTenantChi,
    nameTenantRok,
    priority,
  });
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
export const ValidateLoginEmail = (data) => {
  const { email, password } = data;
  return ValidateData({ email, password });
};
export const ValidateLoginPhoneNumber = (data) => {
  const { phone_number, password } = data;
  return ValidateData({ phone_number, password });
};

export const ValidateGoogle = (data) => {
  const { id, name, email } = data;
  return ValidateData({ id, name, email });
};
export const ValidateFacebook = (data) => {
  const { id, name, email, image } = data;
  return ValidateData({ id, name, email, image });
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
    user_id,
    car_brand,
    car_version,
    car_year,
    province_vehicle,
    car_resgistration,
    type_of_fual_id,
    driver_system,
    door,
    seat,
    car_color,
    car_insurance,
    insurance_company_id,
    level_insurance_id,
    description,
    pubmai,
    mutjum,
    point,
    street,
    province,
    village,
    district,
    post_rent_data,
    currency,
  } = data;
  return ValidateData({
    car_type_id,
    user_id,
    car_brand,
    car_version,
    car_year,
    province_vehicle,
    car_resgistration,
    type_of_fual_id,
    driver_system,
    door,
    seat,
    car_color,
    car_insurance,
    insurance_company_id,
    level_insurance_id,
    description,
    pubmai,
    mutjum,
    point,
    street,
    province,
    village,
    district,
    post_rent_data,
    currency,
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
    type_rent,
    price_rent,
    start_date,
    end_date,
    frist_name,
    last_name,
    village,
    district,
    province,
    phone_number,
    email,
    doc_type,
    description,
    discount,
    total_price,
    booking_fee,
    tax,
    pay_destination,
    khampakan,
    pay_type,
    scope,
    currency,
    jaiykhon,
    // bank_no,
    // pay_status,
  } = data;
  return ValidateData({
    post_id,
    type_rent,
    price_rent,
    start_date,
    end_date,
    frist_name,
    last_name,
    village,
    district,
    province,
    phone_number,
    email,
    doc_type,
    description,
    discount,
    total_price,
    booking_fee,
    tax,
    pay_destination,
    khampakan,
    pay_type,
    scope,
    currency,
    jaiykhon,
    // bank_no,
    // pay_status,
  });
};
export const ValidateCar_rent_update_status = (data) => {
  const { status_id } = data;
  return ValidateData({ status_id });
};
export const ValidateCar_rent_update_status_by_admin = (data) => {
  const { user_id, status_id } = data;
  return ValidateData({ user_id, status_id });
};

export const ValidateLocation = (data) => {
  const { street, point, village, district, province } = data;
  return ValidateData({
    street,
    point,
    village,
    district,
    province,
  });
};

export const ValidatePostSearch = (data) => {
  const { district, province, type_of_fual_id, car_type_id } = data;
  return ValidateData({ district, province, type_of_fual_id, car_type_id });
};

export const ValidateKyc = (data) => {
  const {
    user_type,
    first_name,
    last_name,
    birthday,
    nationality,
    phone_number,
    doc_type,
    point,
    village,
    district,
    province,
    doc_no,
  } = data;
  return ValidateData({
    user_type,
    first_name,
    last_name,
    phone_number,
    birthday: new Date(birthday).toString(),
    nationality,
    doc_type,
    point,
    village,
    district,
    province,
    doc_no,
  });
};

export const ValidatePopular_Places = (data) => {
  const { street, point, village, district, province, details } = data;
  return ValidateData({ street, point, village, district, province, details });
};
