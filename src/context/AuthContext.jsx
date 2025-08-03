import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserProfile } from "../api/user";
import {
  login as loginApi,
  logout as logoutApi,
  adminLogin,
  adminLogout,
} from "../api/auth";
import { toast } from "react-toastify";
import {
  getStoredToken,
  storeToken,
  removeToken,
  isTokenExpired,
  getUserFromToken,
  validateToken,
  isTokenExpiringSoon,
  getTimeUntilExpiry,
  decodeJWT,
} from "../utils/jwtUtils";

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
  const [tokenExpiring, setTokenExpiring] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getUserProfile();

        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          // console.log("✅ Cookie-based auth restored:", response.data.user);
        } else {
          // console.log("❌ No valid cookie session found");
          setUser(null);
        }
      } catch (error) {
        // console.log("❌ Auth check failed:", error.message);
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiry = () => {
      const token = getStoredToken();
      if (!token) return;

      if (isTokenExpired(token)) {
        logout();
        toast.error("Your session has expired. Please log in again.");
        return;
      }

      const expiringSoon = isTokenExpiringSoon(token, 15); // 15 minutes warning
      if (expiringSoon && !tokenExpiring) {
        const minutesLeft = getTimeUntilExpiry(token);
        setTokenExpiring(true);
        toast.warning(
          `Your session will expire in ${minutesLeft} minutes. Please save your work.`
        );
      }
    };
    const interval = setInterval(checkTokenExpiry, 60000);
    checkTokenExpiry();

    return () => clearInterval(interval);
  }, [user, tokenExpiring]);

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
        if (response.data.requiresOtp) {
          return {
            success: true,
            requiresOtp: true,
            message: response.data.message || "OTP sent to your email",
            email: email,
          };
        }
        const { user: userData, token } = response.data;

        if (!userData) {
          // console.error(
          //   "User data is undefined or null. Check server response."
          // );
        }
        if (token) {
          const tokenStored = storeToken(token);
          if (!tokenStored) {
            // console.error("Failed to store JWT token");
            return {
              success: false,
              message: "Failed to save session. Please try again.",
            };
          }
          const validation = validateToken(token);
          if (!validation.isValid) {
            // console.error("Invalid token received:", validation.errors);
            removeToken();
            return {
              success: false,
              message: "Invalid session token received.",
            };
          }

          setTokenExpiring(false);
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
      // console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      toast.success("Logged out successfully!");
    } catch (error) {
      // console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
    removeToken();
    setUser(null);
    setTokenExpiring(false);
  };

  const adminLogoutHandler = async () => {
    try {
      await adminLogout();
      toast.success("Admin logged out successfully!");
    } catch (error) {
      toast.error("Admin logout failed. Please try again.");
    }
    setUser(null);
  };

  const completeLoginAfterOTP = async (userData) => {
    setUser(userData);
    return { success: true, user: userData };
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    const admin = user?.role === "admin";
    return admin;
  };

  const getTokenInfo = () => {
    const token = getStoredToken();
    if (!token) return null;

    return {
      token,
      isExpired: isTokenExpired(token),
      isExpiringSoon: isTokenExpiringSoon(token),
      minutesUntilExpiry: getTimeUntilExpiry(token),
      validation: validateToken(token),
    };
  };

  const refreshUserFromToken = () => {
    const token = getStoredToken();
    if (!token) return false;

    const userFromToken = getUserFromToken(token);
    if (userFromToken) {
      setUser(userFromToken);
      return true;
    }
    return false;
  };

  const checkAuthState = async () => {
    try {
      const response = await getUserProfile();

      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        // console.log("✅ Auth state restored from cookies:", response.data.user);
        return true;
      } else {
        // console.log("❌ No valid cookie session");
        setUser(null);
        return false;
      }
    } catch (error) {
      // console.log("❌ Auth state check failed:", error.message);
      setUser(null);
      return false;
    }
  };

  const value = {
    user,
    loading,
    tokenExpiring,
    login,
    logout,
    adminLogout: adminLogoutHandler,
    completeLoginAfterOTP,
    isAuthenticated,
    isAdmin,
    getTokenInfo,
    refreshUserFromToken,
    checkAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
