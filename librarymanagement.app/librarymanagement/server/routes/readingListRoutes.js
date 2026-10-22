const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getReadingList,
  addToReadingList,
  removeFromReadingList,
} = require('../controllers/readingListController');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getReadingList);
router.post('/', addToReadingList);
router.delete('/:bookId', removeFromReadingList);

module.exports = router;
