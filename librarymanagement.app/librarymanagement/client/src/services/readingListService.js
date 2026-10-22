import api from './api';

export const getReadingList = async () => {
  const response = await api.get('/reading-list');
  return response.data;
};

export const addToReadingList = async (bookId) => {
  const response = await api.post('/reading-list', { bookId });
  return response.data;
};

export const removeFromReadingList = async (bookId) => {
  const response = await api.delete(`/reading-list/${bookId}`);
  return response.data;
};
