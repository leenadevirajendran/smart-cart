import api from './api';

export const getAllCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (name, description) => {
  const response = await api.post('/categories', { name, description });
  return response.data;
};

export const updateCategory = async (id, name, description) => {
  const response = await api.put(`/categories/${id}`, { name, description });
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};