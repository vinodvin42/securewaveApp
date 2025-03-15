import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { UserValidationSchema } from "./validations";
import GenericTable from "../Generics/Table";
import { useState, useEffect } from "react";
import axios from "axios";
import "./UserCreationForm.css"; // Import custom CSS for additional styling
import { Spinner, Alert } from "react-bootstrap"; // Import Bootstrap components

const UserCreationForm = () => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(UserValidationSchema),
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (currentUser) {
            Object.keys(currentUser).forEach((key) => {
                setValue(key, currentUser[key]);
            });
        }
    }, [currentUser, setValue]);

    const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                "https://localhost:5189/api/Auth/Users",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const fetchedData = response.data;
            setData(fetchedData);

            if (fetchedData.length > 0) {
                const dynamicColumns = Object.keys(fetchedData[0]).map((key) => ({
                    header: key.charAt(0).toUpperCase() + key.slice(1),
                    field: key,
                }));
                setColumns(dynamicColumns);
            } else {
                setError("No users found.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError("Failed to fetch user data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (newUser) => {
        try {
            const response = await axios.post("/api/users", newUser);
            setData([...data, response.data]);
            setSuccessMessage("User created successfully!");
            reset(); // Reset the form after successful creation
        } catch (error) {
            console.error("Error creating user:", error);
            setError("Failed to create user. Please try again.");
        }
    };

    const handleUpdate = async (updatedUser) => {
        try {
            await axios.put(`/api/users/${updatedUser.id}`, updatedUser);
            setData(data.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
            setSuccessMessage("User updated successfully!");
            setIsEditing(false);
            setCurrentUser(null);
            reset(); // Reset the form after successful update
        } catch (error) {
            console.error("Error updating user:", error);
            setError("Failed to update user. Please try again.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/users/${id}`);
            setData(data.filter((user) => user.id !== id));
            setSuccessMessage("User deleted successfully!");
        } catch (error) {
            console.error("Error deleting user:", error);
            setError("Failed to delete user. Please try again.");
        }
    };

    const onSubmit = (userData) => {
        if (isEditing) {
            handleUpdate({ ...currentUser, ...userData });
        } else {
            handleCreate(userData);
        }
    };

    const handleEdit = (user) => {
        setIsEditing(true);
        setCurrentUser(user);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setCurrentUser(null);
        reset(); // Reset the form on cancel
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">{isEditing ? "Edit User" : "Create New User"}</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
            <form onSubmit={handleSubmit(onSubmit)} className="user-form shadow p-4 rounded bg-light">
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label>Username</label>
                        <input
                            type="text"
                            className={`form-control ${errors.username ? "is-invalid" : ""}`}
                            {...register("username")}
                        />
                        <div className="invalid-feedback">{errors.username?.message}</div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <label>Password</label>
                        <input
                            type="password"
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                            {...register("password")}
                        />
                        <div className="invalid-feedback">{errors.password?.message}</div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                            {...register("confirmPassword")}
                        />
                        <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label>Email</label>
                        <input
                            type="email"
                            className={`form-control ${errors.email ? "is-invalid" : ""}`}
                            {...register("email")}
                        />
                        <div className="invalid-feedback">{errors.email?.message}</div>
                    </div>

                    <div className="col-md-4 mb-3">
                        <label>Phone Number</label>
                        <input
                            type="text"
                            className={`form-control ${errors.phoneNumber ? "is-invalid" : ""}`}
                            {...register("phoneNumber")}
                        />
                        <div className="invalid-feedback">{errors.phoneNumber?.message}</div>
                    </div>

                    <div className="col-md-4 mb-3 d-flex align-items-end gap-2">
                        <button type="submit" className="btn btn-primary w-100">
                            {isEditing ? "Update User" : "Create User"}
                        </button>
                        {isEditing && (
                            <button type="button" className="btn btn-secondary w-100" onClick={handleCancel}>
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <h2 className="text-center mt-5 mb-4">User Management</h2>
            {loading ? (
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : error ? (
                <div className="text-center text-danger">{error}</div>
            ) : (
                <GenericTable
                    columns={columns}
                    data={data}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default UserCreationForm;