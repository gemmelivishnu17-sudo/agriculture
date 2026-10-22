const mongoose = require('mongoose');
const Book = require('../models/Book');
const ReadingListItem = require('../models/ReadingListItem');

const getReadingList = async (req, res) => {
  try {
    const items = await ReadingListItem.find({ user: req.user._id })
      .populate('book', 'title author isbn category image availableCopies description')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not load your reading list.' });
  }
};

const addToReadingList = async (req, res) => {
  try {
    const { bookId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ success: false, message: 'A valid book ID is required.' });
    }

    const bookExists = await Book.exists({ _id: bookId });
    if (!bookExists) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    const item = await ReadingListItem.findOneAndUpdate(
      { user: req.user._id, book: bookId },
      { $setOnInsert: { user: req.user._id, book: bookId } },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    ).populate('book', 'title author isbn category image availableCopies description');

    return res.status(200).json({ success: true, item });
  } catch (error) {
    if (error.code === 11000) {
      const item = await ReadingListItem.findOne({ user: req.user._id, book: req.body.bookId })
        .populate('book', 'title author isbn category image availableCopies description');
      return res.status(200).json({ success: true, item });
    }
    return res.status(500).json({ success: false, message: 'Could not save this book to your reading list.' });
  }
};

const removeFromReadingList = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.bookId)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID.' });
    }

    const item = await ReadingListItem.findOneAndDelete({ user: req.user._id, book: req.params.bookId });
    if (!item) {
      return res.status(404).json({ success: false, message: 'This book is not in your reading list.' });
    }

    return res.status(200).json({ success: true, bookId: req.params.bookId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Could not remove this book from your reading list.' });
  }
};

module.exports = { getReadingList, addToReadingList, removeFromReadingList };
