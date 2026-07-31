import api from './api';

// Get all reviews for a product
export const getProductReviews = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

// Get average rating + review count for a product
export const getReviewSummary = async (productId) => {
  const response = await api.get(`/reviews/product/${productId}/summary`);
  return response.data;
};

// Buyer adds a review
export const addReview = async (productId, rating, comment) => {
  const response = await api.post(
    `/reviews/product/${productId}?rating=${rating}&comment=${encodeURIComponent(comment || '')}`
  );
  return response.data;
};

// Buyer deletes their own review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};