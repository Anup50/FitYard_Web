import axios from "axios";
import { getCsrfToken, clearCsrfToken, refreshCsrfToken } from "./csrfService";
import {
  getStoredToken,
  isTokenExpired,
  validateToken,
  removeToken,
} from "../utils/jwtUtils";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getStoredToken();
    if (token) {
      const validation = validateToken(token);
      if (validation.isValid && !isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // console.log(
        //   "Invalid or expired token detected, removing:",
        //   validation.errors
        // );
        removeToken();
      }
    }

    if (
      ["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())
    ) {
      try {
        const csrfToken = await getCsrfToken();
        config.headers["X-CSRF-Token"] = csrfToken;
      } catch (error) {
        // console.error("Failed to get CSRF token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 403 &&
      error.response?.data?.error === "CSRF_TOKEN_INVALID" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await refreshCsrfToken();
        const newToken = await getCsrfToken();
        originalRequest.headers["X-CSRF-Token"] = newToken;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // console.error("Failed to refresh CSRF token:", refreshError);
        clearCsrfToken();
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      if (
        originalRequest.url?.includes("/update-password") ||
        originalRequest.url?.includes("/change-password")
      ) {
        return Promise.reject(error);
      }

      // Session expired or invalid - clear both CSRF and JWT tokens
      // console.log(
      //   "401 Unauthorized - clearing tokens and redirecting to login"
      // );
      clearCsrfToken();
      removeToken();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
