import axiosInstance from "./axiosInstance";

export const addToCart = (itemId, size) =>
  axiosInstance.post("/api/cart/add", { itemId, size });

export const removeFromCart = (itemId, size) =>
  axiosInstance.post("/api/cart/remove", { itemId, size });

export const updateCart = (itemId, size, quantity) =>
  axiosInstance.post("/api/cart/update", { itemId, size, quantity });

export const getCart = () => axiosInstance.get("/api/cart");

export const getUserCart = () => axiosInstance.post("/api/cart/get");

export const clearCart = () => axiosInstance.post("/api/cart/clear");
