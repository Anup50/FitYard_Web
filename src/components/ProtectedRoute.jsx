import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // console.log("ProtectedRoute redirecting to login - user:", user);
    // console.log("ProtectedRoute - isAuthenticated():", isAuthenticated());
    // console.log("ProtectedRoute - location:", location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if trying to access admin without admin role
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
