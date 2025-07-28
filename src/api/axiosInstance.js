import axios from "axios";
import { getCsrfToken, clearCsrfToken, refreshCsrfToken } from "./csrfService";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Send cookies with every request
  timeout: 10000,
});

// Request interceptor to add CSRF token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Only add CSRF token for state-changing operations
    if (
      ["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())
    ) {
      try {
        const token = await getCsrfToken();
        config.headers["X-CSRF-Token"] = token;
      } catch (error) {
        console.error("Failed to get CSRF token:", error);
        // Continue with request even if CSRF token fails
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and CSRF token refresh
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
      // CSRF token is invalid, try refreshing it once
      originalRequest._retry = true;

      try {
        await refreshCsrfToken();
        const newToken = await getCsrfToken();
        originalRequest.headers["X-CSRF-Token"] = newToken;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh CSRF token:", refreshError);
        clearCsrfToken();
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      // Session expired or invalid
      clearCsrfToken();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
