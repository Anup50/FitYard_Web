import axiosInstance from "../api/axiosInstance";

// Use the existing CSRF-enabled axios instance
const api = axiosInstance;

/**
 * Password Management API Functions
 */

/**
 * Update user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise} API response
 */
export const updatePassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await api.post("/api/user/update-password", {
      userId,
      currentPassword,
      newPassword,
    });
    
    // Check if the response indicates failure even with 200 status
    if (response.data && !response.data.success) {
      throw {
        message: response.data.message || "Failed to update password",
        status: response.status,
        data: response.data,
      };
    }
    
    return response.data;
  } catch (error) {
    // Handle axios errors (4xx, 5xx status codes)
    if (error.response) {
      throw {
        message: error.response.data?.message || "Failed to update password",
        status: error.response.status,
        data: error.response.data,
      };
    }
    
    // Handle our custom errors or network errors
    throw {
      message: error.message || "Failed to update password",
      status: error.status || 500,
      data: error.data,
    };
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} API response
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/api/user/forgot-password", { email });
    
    // Check if the response indicates failure even with 200 status
    if (response.data && !response.data.success) {
      throw {
        message: response.data.message || "Failed to send reset email",
        status: response.status,
        data: response.data,
      };
    }
    
    return response.data;
  } catch (error) {
    // Handle axios errors (4xx, 5xx status codes)
    if (error.response) {
      throw {
        message: error.response.data?.message || "Failed to send reset email",
        status: error.response.status,
        data: error.response.data,
      };
    }
    
    // Handle our custom errors or network errors
    throw {
      message: error.message || "Failed to send reset email",
      status: error.status || 500,
      data: error.data,
    };
  }
};

/**
 * Reset password with token
 * @param {string} email - User email
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise} API response
 */
export const resetPassword = async (email, token, newPassword) => {
  try {
    const response = await api.post("/api/user/reset-password", {
      email,
      token,
      newPassword,
    });
    
    // Check if the response indicates failure even with 200 status
    if (response.data && !response.data.success) {
      throw {
        message: response.data.message || "Failed to reset password",
        status: response.status,
        data: response.data,
      };
    }
    
    return response.data;
  } catch (error) {
    // Handle axios errors (4xx, 5xx status codes)
    if (error.response) {
      throw {
        message: error.response.data?.message || "Failed to reset password",
        status: error.response.status,
        data: error.response.data,
      };
    }
    
    // Handle our custom errors or network errors
    throw {
      message: error.message || "Failed to reset password",
      status: error.status || 500,
      data: error.data,
    };
  }
};

/**
 * Get password status for user
 * @param {string} userId - User ID
 * @returns {Promise} API response
 */
export const getPasswordStatus = async (userId) => {
  try {
    const response = await api.get("/api/user/password-status", {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || "Failed to get password status",
      status: error.response?.status,
      data: error.response?.data,
    };
  }
};

/**
 * Force password change (Admin only)
 * @param {string} userId - Target user ID
 * @returns {Promise} API response
 */
export const forcePasswordChange = async (userId) => {
  try {
    const response = await api.post("/api/user/admin/force-password-change", {
      userId,
    });
    return response.data;
  } catch (error) {
    throw {
      message:
        error.response?.data?.message || "Failed to force password change",
      status: error.response?.status,
      data: error.response?.data,
    };
  }
};

export default api;
