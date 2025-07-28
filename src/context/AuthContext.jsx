// Copy this file to: CW_1/frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile } from "../api/user";
import {
  login as loginApi,
  logout as logoutApi,
  adminLogin,
  adminLogout,
} from "../api/auth";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getUserProfile();
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, isAdmin = false, captcha = null) => {
    try {
      const loginData = { email, password };
      if (captcha) {
        loginData.captcha = captcha;
      }

      const response = isAdmin
        ? await adminLogin(loginData)
        : await loginApi(loginData);

      if (response.data.success) {
        // Check if OTP verification is required
        if (response.data.requiresOtp) {
          return {
            success: true,
            requiresOtp: true,
            message: response.data.message || "OTP sent to your email",
            email: email, // Pass email for OTP verification
          };
        }

        // Normal login without OTP
        const { user: userData } = response.data;

        if (!userData) {
          console.error(
            "User data is undefined or null. Check server response."
          );
        }

        setUser(userData);
        return { success: true, user: userData };
      } else {
        return {
          success: false,
          message: response.data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await logoutApi(); // Call backend to clear session cookie
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
    setUser(null);
  };

  const adminLogoutHandler = async () => {
    try {
      await adminLogout(); // Call backend to clear admin session
      toast.success("Admin logged out successfully!");
    } catch (error) {
      console.error("Admin logout error:", error);
      toast.error("Admin logout failed. Please try again.");
    }
    setUser(null);
  };

  const completeLoginAfterOTP = async (userData) => {
    // Set user data after successful OTP verification for login
    setUser(userData);
    return { success: true, user: userData };
  };

  const isAuthenticated = () => {
    const authenticated = !!user;
    return authenticated;
  };

  const isAdmin = () => {
    const admin = user?.role === "admin";
    return admin;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    adminLogout: adminLogoutHandler,
    completeLoginAfterOTP,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
