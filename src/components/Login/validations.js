import * as yup from "yup";

export const LoginValidationSchema = yup
  .object()
  .shape({
    username: yup.string().required("Please enter user name"),
  })
  .required();
