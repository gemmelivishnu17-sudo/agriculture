const express = require('express');
const {
  createBook,
  getBooks,
  getBookCategories,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
} = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', searchBooks);
router.get('/categories', getBookCategories);
router.get('/', getBooks);
router.get('/:id', getBookById);

router.post('/', authMiddleware, createBook);
router.put('/:id', authMiddleware, updateBook);
router.delete('/:id', authMiddleware, deleteBook);

module.exports = router;
