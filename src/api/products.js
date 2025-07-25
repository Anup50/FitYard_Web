import axiosInstance from "./axiosInstance";

export const addProduct = async (formData, token) => {
  return axiosInstance.post("/api/product/add", formData, {
    headers: { token }, // Keep this for backward compatibility with your backend
  });
};

export const fetchProducts = () => axiosInstance.get("/api/product/list");
export const removeProduct = (id) =>
  axiosInstance.delete(`/api/product/remove/${id}`);
export const fetchSingleProduct = (id) =>
  axiosInstance.get(`/api/product/single/${id}`);
