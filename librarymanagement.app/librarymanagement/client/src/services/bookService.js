import api from './api';

export const getBooks = async (params = {}) => {
  const response = await api.get('/books', { params });
  return response.data;
};

export const getBookCategories = async () => {
  const response = await api.get('/books/categories');
  return response.data;
};

export const getBookById = async (id) => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

export const searchBooks = async (query, params = {}) => {
  const response = await api.get('/books/search', { params: { ...params, q: query } });
  return response.data;
};

export const createBook = async (bookData) => {
  const response = await api.post('/books', bookData);
  return response.data;
};

export const updateBook = async (id, bookData) => {
  const response = await api.put(`/books/${id}`, bookData);
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`/books/${id}`);
  return response.data;
};
