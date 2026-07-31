import api from './api';

// Get all currently active flash sales
export const getActiveFlashSales = async () => {
  const response = await api.get('/flash-sales/active');
  return response.data;
};

// Get live remaining stock for a specific flash sale
export const getFlashSaleStock = async (flashSaleId) => {
  const response = await api.get(`/flash-sales/${flashSaleId}/stock`);
  return response.data;
};

// Attempt to buy a flash sale item
export const buyFlashSaleItem = async (flashSaleId, shippingAddress) => {
  const response = await api.post(
    `/flash-sales/${flashSaleId}/buy?shippingAddress=${encodeURIComponent(shippingAddress)}`
  );
  return response.data;
};