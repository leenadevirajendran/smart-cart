import api from './api';

export const getMyProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateMyProfile = async (data) => {
  const response = await api.put('/users/me', data);
  return response.data;
};