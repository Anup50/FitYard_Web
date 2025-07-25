import axiosInstance from "./axiosInstance";

export const addToCart = (itemId, size) =>
  axiosInstance.post("/api/cart/add", { itemId, size });

export const removeFromCart = (itemId, size) =>
  axiosInstance.post("/api/cart/remove", { itemId, size });

export const updateCart = (cartData) =>
  axiosInstance.put("/api/cart/update", cartData);

export const getCart = () => axiosInstance.get("/api/cart");

export const getUserCart = () => axiosInstance.get("/api/cart/get");

export const clearCart = () => axiosInstance.post("/api/cart/clear");
