import { jwtDecode } from "jwt-decode";

/**
 * JWT Utility Functions for FitYard
 * Handles JWT token decoding, validation, and management
 */

/**
 * Decode JWT token and return payload
 * @param {string} token - JWT token to decode
 * @returns {object|null} - Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if expired, false if valid
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Date.now() / 1000; // Convert to seconds
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Token expiry check error:", error);
    return true;
  }
};

/**
 * Get token expiration time in readable format
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000); // Convert from seconds to milliseconds
  } catch (error) {
    console.error("Get token expiration error:", error);
    return null;
  }
};

/**
 * Get time until token expires in minutes
 * @param {string} token - JWT token
 * @returns {number|null} - Minutes until expiration or null
 */
export const getTimeUntilExpiry = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    const currentTime = Date.now() / 1000;
    const timeLeft = decoded.exp - currentTime;

    return timeLeft > 0 ? Math.floor(timeLeft / 60) : 0; // Convert to minutes
  } catch (error) {
    console.error("Time until expiry error:", error);
    return null;
  }
};

/**
 * Get user information from JWT token
 * @param {string} token - JWT token
 * @returns {object|null} - User data from token or null
 */
export const getUserFromToken = (token) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded) {
      return null;
    }

    const user = {
      id: decoded.userId || decoded.id || decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role || decoded.userType,
      isAdmin: decoded.isAdmin || decoded.role === "admin",
      permissions: decoded.permissions || [],
      ...decoded.user,
    };

    return user;
  } catch (error) {
    console.error("Get user from token error:", error);
    return null;
  }
};

/**
 * Check if token is about to expire (within specified minutes)
 * @param {string} token - JWT token
 * @param {number} warningMinutes - Minutes before expiry to warn (default: 15)
 * @returns {boolean} - True if expiring soon
 */
export const isTokenExpiringSoon = (token, warningMinutes = 15) => {
  try {
    const minutesLeft = getTimeUntilExpiry(token);
    return (
      minutesLeft !== null && minutesLeft <= warningMinutes && minutesLeft > 0
    );
  } catch (error) {
    console.error("Token expiring soon check error:", error);
    return false;
  }
};

/**
 * Validate JWT token structure and basic requirements
 * @param {string} token - JWT token to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validateToken = (token) => {
  const result = {
    isValid: false,
    errors: [],
    decoded: null,
  };

  try {
    if (!token) {
      result.errors.push("Token is missing");
      return result;
    }

    if (typeof token !== "string") {
      result.errors.push("Token must be a string");
      return result;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      result.errors.push("Invalid JWT structure");
      return result;
    }

    const decoded = decodeJWT(token);
    if (!decoded) {
      result.errors.push("Cannot decode token");
      return result;
    }

    result.decoded = decoded;

    if (isTokenExpired(token)) {
      result.errors.push("Token has expired");
      return result;
    }

    if (!decoded.exp) {
      result.errors.push("Token missing expiration");
    }

    if (!decoded.iat) {
      result.errors.push("Token missing issued at time");
    }

    if (result.errors.length === 0) {
      result.isValid = true;
    }

    return result;
  } catch (error) {
    console.error("Token validation error:", error);
    result.errors.push(`Validation error: ${error.message}`);
    return result;
  }
};

/**
 * Get stored token from localStorage
 * @returns {string|null} - JWT token or null
 */
export const getStoredToken = () => {
  try {
    return localStorage.getItem("token");
  } catch (error) {
    console.error("Get stored token error:", error);
    return null;
  }
};

/**
 * Store JWT token in localStorage
 * @param {string} token - JWT token to store
 * @returns {boolean} - Success status
 */
export const storeToken = (token) => {
  try {
    if (!token) {
      console.error("Cannot store empty token");
      return false;
    }

    localStorage.setItem("token", token);
    return true;
  } catch (error) {
    console.error("Store token error:", error);
    return false;
  }
};

/**
 * Remove token from localStorage
 * @returns {boolean} - Success status
 */
export const removeToken = () => {
  try {
    localStorage.removeItem("token");
    return true;
  } catch (error) {
    console.error("Remove token error:", error);
    return false;
  }
};

/**
 * Check if user has specific permission
 * @param {string} token - JWT token
 * @param {string} permission - Permission to check
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (token, permission) => {
  try {
    const user = getUserFromToken(token);
    if (!user || !user.permissions) {
      return false;
    }

    return user.permissions.includes(permission);
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
};

/**
 * Check if user is admin
 * @param {string} token - JWT token
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (token) => {
  try {
    const user = getUserFromToken(token);
    return user ? user.isAdmin : false;
  } catch (error) {
    console.error("Admin check error:", error);
    return false;
  }
};

/**
 * Format token expiration for display
 * @param {string} token - JWT token
 * @returns {string} - Formatted expiration string
 */
export const formatTokenExpiration = (token) => {
  try {
    const expiration = getTokenExpiration(token);
    if (!expiration) {
      return "Unknown expiration";
    }

    return expiration.toLocaleString();
  } catch (error) {
    console.error("Format token expiration error:", error);
    return "Error formatting expiration";
  }
};

export default {
  decodeJWT,
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiry,
  getUserFromToken,
  isTokenExpiringSoon,
  validateToken,
  getStoredToken,
  storeToken,
  removeToken,
  hasPermission,
  isAdmin,
  formatTokenExpiration,
};
