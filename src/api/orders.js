import axiosInstance from "./axiosInstance";

// Get user orders
export const getUserOrders = () => axiosInstance.get("/api/order/userorders");

// Get order details by ID
export const getOrderDetails = (orderId) =>
  axiosInstance.get(`/api/order/${orderId}`);

// Cancel order
export const cancelOrder = (orderId) =>
  axiosInstance.put(`/api/order/cancel/${orderId}`);

// Update order status (admin)
export const updateOrderStatus = (orderId, status) =>
  axiosInstance.put(`/api/order/status/${orderId}`, { status });

// Get all orders (admin)
export const getAllOrders = () => axiosInstance.get("/api/order/list");

// Track order
export const trackOrder = (orderId) =>
  axiosInstance.get(`/api/order/track/${orderId}`);

// Place order with Cash on Delivery
export const placeCODOrder = (orderData) =>
  axiosInstance.post("/api/order/place", orderData);

// Place order with Stripe
export const placeStripeOrder = (orderData) =>
  axiosInstance.post("/api/order/stripe", orderData);

// Place order with Razorpay
export const placeRazorpayOrder = (orderData) =>
  axiosInstance.post("/api/order/razorpay", orderData);

// Verify Razorpay payment
export const verifyRazorpayPayment = (paymentData) =>
  axiosInstance.post("/api/order/verifyRazorpay", paymentData);
