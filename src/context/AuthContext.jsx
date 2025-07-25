// Copy this file to: CW_1/frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile } from "../api/user";
import {
  login as loginApi,
  logout as logoutApi,
  adminLogin,
} from "../api/auth";

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
      console.log("AuthContext - Starting auth check...");
      try {
        const response = await getUserProfile();
        console.log("AuthContext - getUserProfile response:", response.data);
        if (response.data.success) {
          console.log(
            "AuthContext - Setting user from auth check:",
            response.data.user
          );
          setUser(response.data.user);
        } else {
          console.log("AuthContext - Auth check failed, no user data");
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      }
      console.log("AuthContext - Setting loading to false");
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
        const { user: userData } = response.data;
        console.log("AuthContext login response:", response.data);
        console.log("Extracted user data:", userData);

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
    } catch (error) {
      console.error("Logout error:", error);
    }
    setUser(null);
  };

  const isAuthenticated = () => {
    const authenticated = !!user;
    console.log(
      "isAuthenticated check - user:",
      user,
      "result:",
      authenticated
    );
    return authenticated;
  };

  const isAdmin = () => {
    const admin = user?.role === "admin";
    console.log("isAdmin check - user role:", user?.role, "result:", admin);
    return admin;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
