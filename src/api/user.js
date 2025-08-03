import axiosInstance from "./axiosInstance";

export const getUserProfile = () => axiosInstance.get("/api/user/profile");

export const updateUserProfile = (data) =>
  axiosInstance.put("/api/user/profile", data);

export const changePassword = (data) =>
  axiosInstance.put("/api/user/change-password", data);

export const deleteUserAccount = () =>
  axiosInstance.delete("/api/user/account");

export const getUserOrders = () => axiosInstance.get("/api/order/userorders");
