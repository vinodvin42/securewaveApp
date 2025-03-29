import "bootstrap/dist/css/bootstrap.min.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginValidationSchema } from "./validations";
import axios from "axios";
import { setAuthToken } from "../../helpers/setAuthToken";
import { useState, useEffect } from "react";
import "./login.css"; // Import custom CSS for additional styling

const Login = () => {
  const [serverError, setServerError] = useState(""); // State for handling server error messages
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [success, setSuccess] = useState(false); // State for success message
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  // Default state for the login form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LoginValidationSchema),
  });

  // Effect to clear tokens and reset state on component load
  useEffect(() => {
    // Clear any existing JWT token when the login component is loaded
    localStorage.removeItem("token"); // Remove token from local storage
    localStorage.removeItem("username"); // Remove username from local storage

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
    setLoading(true); // Start loading
    setServerError(""); // Clear previous errors
    setSuccess(false); // Reset success state

    try {
      const response = await axios.post(
        "https://localhost:5189/api/Auth/Login",
        values
      );

      // Get token from response
      const token = response.data.token;

      // Set JWT token to local storage
      localStorage.setItem("token", token);

      // Set token to axios common header
      setAuthToken(token);

      // Set username
      localStorage.setItem("username", values.username);

      // Set success state
      setSuccess(true);

      // Redirect user to home page after a short delay
      setTimeout(() => {
        window.location.href = "/dashboard"; // Redirect to dashboard
      }, 1000); // Redirect after 1 second
    } catch (error) {
      console.error("Error during login:", error);

      // Extract the error message from the response
      const errorMessage =
        error.response?.data || // Check for direct message
        error.response?.data?.message || // Check for nested message
        "An error occurred. Please check your credentials and try again.";

      // Set the server error message
      setServerError(errorMessage);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
            aria-label="Cybersecurity background video"
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
                  style={{ maxWidth: "150px" }}
                  aria-label="SecureWave Logo"
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
              {/* Display success message if login is successful */}
              {success && (
                <div className="alert alert-success" role="alert">
                  Login successful! Redirecting...
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="form-group mb-3">
                  <label htmlFor="username" className="form-label">
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
                    aria-label="Username input"
                  />
                  {errors.username?.message && (
                    <p className="invalid-feedback" role="alert">
                      {errors.username?.message}
                    </p>
                  )}
                </div>
                <div className="form-group mb-4">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      id="password"
                      name="password"
                      {...register("password")}
                      placeholder="Enter your password"
                      aria-label="Password input"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={togglePasswordVisibility}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password?.message && (
                    <p className="invalid-feedback" role="alert">
                      {errors.password?.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
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
