import axiosInstance from "./axiosInstance";

export const addProduct = async (formData) => {
  return axiosInstance.post("/api/product/add", formData);
};

export const fetchProducts = () => axiosInstance.get("/api/product/list");

export const removeProduct = async (id) => {
  return axiosInstance.delete(`/api/product/remove/${id}`, {
    data: { id },
  });
};

export const fetchSingleProduct = (id) =>
  axiosInstance.get(`/api/product/single/${id}`);
