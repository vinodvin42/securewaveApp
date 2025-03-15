import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Layout from "../components/Layout";

const RouteGuard = () => {
  // Function to check if the user has a JWT token
  const hasJWT = () => {
    const token = localStorage.getItem("token");
    return !!token; // If token exists, return true, otherwise false
  };

  // If user has JWT token, allow them to access the route (Outlet)
  // Otherwise, redirect them to the login page
  return hasJWT() ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" />
  );
};

export default RouteGuard;
