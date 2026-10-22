const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  submitContactMessage,
  getContactMessages,
  updateContactMessage,
} = require('../controllers/contactController');

const router = express.Router();

router.post('/', submitContactMessage);
router.get('/', authMiddleware, getContactMessages);
router.patch('/:id', authMiddleware, updateContactMessage);

module.exports = router;