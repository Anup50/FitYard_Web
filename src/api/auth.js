import axiosInstance from "./axiosInstance";

export const register = (data) =>
  axiosInstance.post("/api/user/register", data);
export const login = (data) => axiosInstance.post("/api/user/login", data);
export const adminLogin = (data) => axiosInstance.post("/api/user/admin", data);
export const logout = () => axiosInstance.post("/api/user/logout");
export const verifyOTP = (data) =>
  axiosInstance.post("/api/user/verify-otp", data);
export const resendOTP = (data) =>
  axiosInstance.post("/api/user/resend-otp", data);
