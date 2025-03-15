import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { UserValidationSchema } from "./validations";
import GenericTable from "../Generics/Table";
import { useState, useEffect } from "react";
import axios from "axios";

const UserCreationForm = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(UserValidationSchema),
  });

  // Fetch Data from API on Component Mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    setLoading(true); // Set loading state to true
    setError(null); // Reset previous error state
    console.log("JWT Token:", localStorage.getItem("token"));
    try {
      const response = await axios.get(
        "https://localhost:5189/api/Auth/Users",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Using JWT token for authorization
          },
        }
      );

      const fetchedData = response.data;
      console.log(fetchedData);
      setData(fetchedData); // Set data to state

      // Dynamically generate columns based on the keys of the first object in the response
      if (fetchedData.length > 0) {
        const dynamicColumns = Object.keys(fetchedData[0]).map((key) => ({
          header: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize key names for headers
          field: key,
        }));
        setColumns(dynamicColumns);
      } else {
        // Handle empty data scenario
        setError("No users found.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
      }
    } finally {
      setLoading(false); // Set loading to false after request completion
    }
  };

  // Create New User
  const handleCreate = async (newUser) => {
    try {
      const response = await axios.post("/api/users", newUser); // API endpoint for creating users
      setData([...data, response.data]); // Append newly created user
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Update User
  const handleUpdate = async (updatedUser) => {
    try {
      await axios.put(`/api/users/${updatedUser.id}`, updatedUser); // API endpoint for updating users
      setData(
        data.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
      setIsEditing(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Delete User
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`); // API endpoint for deleting users
      setData(data.filter((user) => user.id !== id)); // Remove deleted user from the list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Handle Form Submit (Create User)
  const onSubmit = (userData) => {
    if (isEditing) {
      handleUpdate({ ...currentUser, ...userData });
    } else {
      handleCreate(userData);
    }
  };

  // Handle Edit Click
  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
  };

  return (
    <div className="container mt-5">
      <h2>{isEditing ? "Edit User" : "Create New User"}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Row 1: Username, Email, Password */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <label>Username</label>
            <input
              type="text"
              className={`form-control ${errors.username ? "is-invalid" : ""}`}
              {...register("username")}
              defaultValue={currentUser?.username || ""}
            />
            <div className="invalid-feedback">{errors.username?.message}</div>
          </div>

          <div className="col-md-4 mb-3">
            <label>Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              {...register("password")}
              defaultValue={currentUser?.password || ""}
            />
            <div className="invalid-feedback">{errors.password?.message}</div>
          </div>

          <div className="col-md-4 mb-3">
            <label>Confirm Password</label>
            <input
              type="password"
              className={`form-control ${
                errors.confirmPassword ? "is-invalid" : ""
              }`}
              {...register("confirmPassword")}
              defaultValue={currentUser?.confirmPassword || ""}
            />
            <div className="invalid-feedback">
              {errors.confirmPassword?.message}
            </div>
          </div>
        </div>

        {/* Row 2: Email, Phone Number */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <label>Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              {...register("email")}
              defaultValue={currentUser?.email || ""}
            />
            <div className="invalid-feedback">{errors.email?.message}</div>
          </div>

          <div className="col-md-4 mb-3">
            <label>Phone Number</label>
            <input
              type="text"
              className={`form-control ${
                errors.phoneNumber ? "is-invalid" : ""
              }`}
              {...register("phoneNumber")}
              defaultValue={currentUser?.phoneNumber || ""}
            />
            <div className="invalid-feedback">
              {errors.phoneNumber?.message}
            </div>
          </div>

          <div className="col-md-4 mb-3">
            {/* Submit Button */}
            <label></label>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                {isEditing ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      </form>

      <h2>User Management</h2>
      <GenericTable
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default UserCreationForm;
