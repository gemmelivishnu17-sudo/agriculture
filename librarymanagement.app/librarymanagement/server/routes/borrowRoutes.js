const express = require('express');
const {
  borrowBook,
  getMyBorrowHistory,
  getBorrowRecordById,
  updateBorrowRecord,
  deleteBorrowRecord,
  returnBorrowedBook,
  getStats,
} = require('../controllers/borrowController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', borrowBook);
router.get('/', getMyBorrowHistory);
router.put('/:id/return', returnBorrowedBook);
router.get('/:id', getBorrowRecordById);
router.put('/:id', updateBorrowRecord);
router.delete('/:id', deleteBorrowRecord);

module.exports = router;
