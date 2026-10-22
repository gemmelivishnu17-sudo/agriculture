import api from './api';

export const borrowBook = async (bookId) => {
  const response = await api.post('/borrow', { bookId });
  return response.data;
};

export const getMyBorrowRecords = async (params = {}) => {
  const response = await api.get('/borrow', { params });
  return response.data;
};

export const getBorrowRecordById = async (id) => {
  const response = await api.get(`/borrow/${id}`);
  return response.data;
};

export const returnBorrowedBook = async (id) => {
  const response = await api.put(`/borrow/${id}/return`);
  return response.data;
};

export const updateBorrowRecord = async (id, updateData) => {
  const response = await api.put(`/borrow/${id}`, updateData);
  return response.data;
};

export const deleteBorrowRecord = async (id) => {
  const response = await api.delete(`/borrow/${id}`);
  return response.data;
};
