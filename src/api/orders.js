import axiosInstance from "./axiosInstance";

export const getUserOrders = () => axiosInstance.get("/api/order/userorders");

export const getOrderDetails = (orderId) =>
  axiosInstance.get(`/api/order/${orderId}`);

export const cancelOrder = (orderId) =>
  axiosInstance.put(`/api/order/cancel/${orderId}`);

export const updateOrderStatus = (orderId, status) =>
  axiosInstance.put(`/api/order/status/${orderId}`, { status });

export const getAllOrders = () => axiosInstance.get("/api/order/list");

export const trackOrder = (orderId) =>
  axiosInstance.get(`/api/order/track/${orderId}`);

export const placeCODOrder = (orderData) =>
  axiosInstance.post("/api/order/place", orderData);

export const placeStripeOrder = (orderData) =>
  axiosInstance.post("/api/order/stripe", orderData);

export const placeRazorpayOrder = (orderData) =>
  axiosInstance.post("/api/order/razorpay", orderData);

export const verifyRazorpayPayment = (paymentData) =>
  axiosInstance.post("/api/order/verifyRazorpay", paymentData);
