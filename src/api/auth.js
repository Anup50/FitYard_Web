import axiosInstance from "./axiosInstance";

export const register = (data) =>
  axiosInstance.post("/api/user/register", data);
export const login = (data) => axiosInstance.post("/api/user/login", data);
export const adminLogin = (data) => axiosInstance.post("/api/user/admin", data);
export const logout = () => axiosInstance.post("/api/user/logout");
export const adminLogout = () => axiosInstance.post("/api/admin/logout");
export const verifyOTP = (data) =>
  axiosInstance.post("/api/user/verify-otp", data);
export const verifyLoginOTP = (data) =>
  axiosInstance.post("/api/user/verify-login-otp", data);
export const resendRegistrationOTP = (data) =>
  axiosInstance.post("/api/user/resend-registration-otp", data);
export const resendLoginOTP = (data) =>
  axiosInstance.post("/api/user/resend-login-otp", data);
