import api from './api';

// Add a product to the logged-in buyer's cart
export const addToCart = async (productId, quantity) => {
    const response = await api.post(
        `/cart/add?productId=${productId}&quantity=${quantity}`
    );
    return response.data;
};
// Get the current cart contents
export const getCart = async() => {
    const response = await api.get('/cart');
    return response.data;
};
// Remove an item from the cart
export const removeFromCart = async(cartItemId) => {
    const response = await api.delete(`/cart/remove/${cartItemId}`);
    return response.data;
};

// Update quantity of a cart item
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  const response = await api.put(
    `/cart/update/${cartItemId}?quantity=${quantity}`
  );
  return response.data;
};