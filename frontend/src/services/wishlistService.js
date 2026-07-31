import api from './api';

// Add a product to the wishlist
export const addToWishlist = async (productId) => {
  const response = await api.post(`/wishlist/add/${productId}`);
  return response.data;
};

// Get all wishlist items for the logged-in buyer
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

// Remove a product from the wishlist
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/remove/${productId}`);
  return response.data;
};