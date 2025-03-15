import * as yup from "yup";

// Validation Schema with Yup
export const UserValidationSchema = yup.object().shape({
  firstName: yup.string().required("First name is required").min(2),
  lastName: yup.string().required("Last name is required").min(2),
  username: yup.string().required("Username is required").min(4),
  email: yup.string().required("Email is required").email("Email is invalid"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Phone number is not valid"),
  acceptTerms: yup.bool().oneOf([true], "Accepting terms is required"),
});
