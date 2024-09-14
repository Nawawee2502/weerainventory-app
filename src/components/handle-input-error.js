export const errorHelper = (formik, values) => ({
  error: formik.errors[values] && formik.touched[values] ? true : false,
  helperText:
    formik.errors[values] && formik.touched[values]
      ? formik.errors[values]
      : null,
});

export const errorArrayHelper = (formik, arrayName, index, fieldName) => ({
  error: formik.errors[arrayName]
    ? formik.errors[arrayName][index]
      ? true
      : false
    : false && formik.touched[arrayName][index][fieldName]
    ? true
    : false,
  helperText: formik.errors[arrayName]
    ? formik.errors[arrayName][index]
      ? formik.errors[arrayName][index][fieldName]
      : undefined
    : undefined && formik.touched[arrayName][index][fieldName]
    ? formik.errors[arrayName][index][fieldName]
    : null,
});

export const errorObjectHelper = (formik, values, name) => ({
  error:
    formik.errors[values] && formik.touched[values]
      ? formik.errors[values][name]
        ? true
        : false
      : false && formik.touched[values][name]
      ? true
      : false,
  helperText:
    formik.errors[values] && formik.touched[values]
      ? formik.errors[values][name]
        ? formik.errors[values][name]
        : undefined
      : undefined && formik.touched[values][name]
      ? formik.errors[values][name]
      : null,
});

//ตัวนี้ใส่ formik.errors...เข้ามาแทนได้เลย
export const ObjectError = (formikErrors) => ({
  error: formikErrors ? true : false,
  helperText: formikErrors
    ? formikErrors
      ? formikErrors
      : undefined
    : undefined
    ? formikErrors
    : null,
});

export const ObjectErrorSelect = (formikErrors) => ({
  error: formikErrors ? true : false,
});
export const TextHelperSelect = (formikErrors) => {
  if (formikErrors) {
    return formikErrors;
  } else {
    return null;
  }
};

export const ObjectErrorTouched = (formikErrors, formikTouched) => ({
  error: formikErrors && formikTouched ? true : false,
  helperText: formikErrors && formikTouched ? formikErrors : null,
});

export const errorText = (formik, values) => {
  if (formik.errors[values] && formik.touched[values]) {
    return formik.errors[values];
  } else {
    return null;
  }
};

export const errorTextObjects = (formik, values, name) => {
  if (formik.errors[values] && formik.touched[values]) {
    if (formik.errors[values][name]) {
      return formik.errors[values][name];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export const errorStatus = (formik, values) => ({
  error: formik.errors[values] && formik.touched[values] ? true : false,
});

export const errorStatusObject = (formik, values, name) => ({
  error:
    formik.errors[values] && formik.touched[values]
      ? formik.errors[values][name]
        ? true
        : false
      : false && formik.touched[values][name]
      ? true
      : false,
});
