import api from './api';

// Place an order from the current cart contents
export const placeOrder = async (shippingAddress) => {
  const response = await api.post(
    `/orders/place?shippingAddress=${encodeURIComponent(shippingAddress)}`
  );
  return response.data;
};

// Get all orders for the logged-in buyer
export const getMyOrders = async () => {
  const response = await api.get('/orders/myorders');
  return response.data;
};

// Seller: update the status of an order (must contain seller's products)
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

// Seller: get all orders containing their products
export const getSellerOrders = async () => {
  const response = await api.get('/orders/seller/all');
  return response.data;
};