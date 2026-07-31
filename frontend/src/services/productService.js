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

// Fetch all categories (for filter dropdown)
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Advanced filter: keyword + category + price range + sort
export const filterProducts = async (filters) => {
  const params = new URLSearchParams();
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);

  const response = await api.get(`/products/filter?${params.toString()}`);
  return response.data;
};

// Trending products — most-ordered across the store
export const getTrendingProducts = async (limit = 8) => {
  const response = await api.get(`/recommendations/trending?limit=${limit}`);
  return response.data;
};

// Related products — same category as a given product
export const getRelatedProducts = async (productId, limit = 4) => {
  const response = await api.get(`/recommendations/related/${productId}?limit=${limit}`);
  return response.data;
};

// Personalized recommendations — requires the buyer to be logged in
export const getPersonalizedProducts = async (limit = 8) => {
  const response = await api.get(`/recommendations/for-you?limit=${limit}`);
  return response.data;
};