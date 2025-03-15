import "bootstrap/dist/css/bootstrap.min.css";
// import "../Login.css"; // Custom CSS for additional styling
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginValidationSchema } from "./validations";
import axios from "axios";
import { setAuthToken } from "../../helpers/setAuthToken";
import { useState, useEffect } from "react"; // Import useState and useEffect

const Login = () => {
  const [serverError, setServerError] = useState(""); // State for handling server error messages

  // Default state for the login form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LoginValidationSchema),
  });

  // Effect to clear tokens and reset state on component load
  useEffect(() => {
    // Clear any existing JWT token when the login component is loaded
    localStorage.removeItem("token"); // Remove token from local storage

    // Clear server error message
    setServerError("");

    // Session timeout logic
    const sessionTimeout = setTimeout(() => {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token"); // Clear the token on session timeout
      window.location.href = "/login"; // Redirect to login
    }, 30 * 60 * 1000); // Set timeout duration (30 minutes in this case)

    // Cleanup the effect
    return () => clearTimeout(sessionTimeout);
  }, []);

  const onSubmit = async (values) => {
    console.log(values);
    try {
      const response = await axios.post(
        "https://localhost:5189/api/Auth/Login",
        values
      );
      console.log(response);
      // Get token from response
      const token = response.data.token;

      // Set JWT token to local storage
      localStorage.setItem("token", token);

      // Set token to axios common header
      setAuthToken(token);

      //set user name
      localStorage.setItem("username", values.username);

      // Redirect user to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error during login:", error);
      // Set the server error message
      setServerError(
        "An error occurred. Please check your credentials and try again."
      );
    }
  };

  console.log(watch("username"));

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row w-100">
        {/* Cybersecurity Video Section */}
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center">
          <video
            width="100%"
            height="auto"
            className="rounded shadow-lg"
            loop
            autoPlay
            muted
          >
            <source src="/videos/login-bg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Login Form Section */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="card shadow-lg border-0 rounded-lg login-card">
            <div className="card-body p-5">
              {/* Logo */}
              <div className="text-center mb-4">
                <img
                  src="/images/securewave-logo.png" // Update the path to your logo
                  alt="SecureWave Logo"
                  className="img-fluid"
                />
              </div>
              <h3 className="card-title text-center mb-4">
                Login to SecureWave
              </h3>
              {/* Display server error message if exists */}
              {serverError && (
                <div className="alert alert-danger" role="alert">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="form-group mb-3">
                  <label htmlFor="username" className="form-label text-left">
                    Username
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.username ? "is-invalid" : ""
                    }`}
                    id="username"
                    name="username"
                    {...register("username")}
                    placeholder="Enter your username"
                  />
                  {errors.username?.message && (
                    <p className="invalid-feedback">
                      {errors.username?.message}
                    </p>
                  )}
                </div>
                <div className="form-group mb-4">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    id="password"
                    name="password"
                    {...register("password")}
                    placeholder="Enter your password"
                  />
                  {errors.password?.message && (
                    <p className="invalid-feedback">
                      {errors.password?.message}
                    </p>
                  )}
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2">
                  Login
                </button>
              </form>
              <div className="text-center mt-3">
                <a href="/forgot-password" className="text-decoration-none">
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
