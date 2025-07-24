import axiosInstance from "./axiosInstance";

// Get user profile
export const getUserProfile = () => axiosInstance.get("/api/user/profile");

// Update user profile
export const updateUserProfile = (data) =>
  axiosInstance.put("/api/user/profile", data);

// Change password
export const changePassword = (data) =>
  axiosInstance.put("/api/user/change-password", data);

// Delete user account
export const deleteUserAccount = () =>
  axiosInstance.delete("/api/user/account");

// Get user orders
export const getUserOrders = () => axiosInstance.get("/api/order/userorders");
