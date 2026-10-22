import api from './api';

export const submitContactMessage = async (message) => {
  const response = await api.post('/contact-messages', message);
  return response.data;
};

export const getContactMessages = async (params = {}) => {
  const response = await api.get('/contact-messages', { params });
  return response.data;
};

export const updateContactMessage = async (id, status) => {
  const response = await api.patch(`/contact-messages/${id}`, { status });
  return response.data;
};