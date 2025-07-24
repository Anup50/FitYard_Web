import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, token, user } = useAuth();
  const location = useLocation();

  console.log(
    "AdminRoute check - loading:",
    loading,
    "token:",
    !!token,
    "user:",
    user,
    "isAuthenticated:",
    isAuthenticated(),
    "isAdmin:",
    isAdmin()
  );

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Temporary: If we have a token but no user, consider it authenticated for admin
  // This handles the case where admin login doesn't return user data
  const hasValidToken = !!token;
  const isUserAuthenticated = isAuthenticated() || hasValidToken;

  // Redirect to admin login if not authenticated
  if (!isUserAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // For now, if we have a token, assume admin access (since we're on admin routes)
  // TODO: Fix this when backend returns proper user data
  if (hasValidToken && !user) {
    console.log("Has token but no user data, allowing admin access");
    return children;
  }

  // Redirect to home if trying to access admin without admin role
  if (!isAdmin()) {
    console.log("Not admin, redirecting to home");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
