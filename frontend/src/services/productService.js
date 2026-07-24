import api from './api';

// Fetch all active products (public endpoint, no token needed)
export const getAllProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// Fetch a single product by ID
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Search products by keyword
export const searchProducts = async (keyword) => {
  const response = await api.get(`/products/search?keyword=${keyword}`);
  return response.data;
};