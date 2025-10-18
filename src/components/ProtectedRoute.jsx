import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/auth" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
