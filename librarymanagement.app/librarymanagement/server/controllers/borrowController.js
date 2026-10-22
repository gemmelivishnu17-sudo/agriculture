const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const User = require('../models/User');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const resolveBorrowStatus = (record) => {
  if (!record) return 'borrowed';

  if (record.status === 'returned') {
    return 'returned';
  }

  const dueDate = record.dueDate ? new Date(record.dueDate) : null;
  if (dueDate && dueDate < new Date()) {
    return 'overdue';
  }

  return 'borrowed';
};

const borrowBook = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required.',
      });
    }

    if (!isValidId(bookId)) {
      return res.status(400).json({ success: false, message: 'Invalid book ID.' });
    }

    const existingBorrow = await BorrowRecord.findOne({
      book: bookId,
      user: req.user._id,
      status: { $ne: 'returned' },
    });

    if (existingBorrow) {
      return res.status(400).json({ success: false, message: 'You already have this book borrowed.' });
    }

    // Reserve a copy atomically so simultaneous requests cannot over-borrow inventory.
    const book = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );
    if (!book) {
      const exists = await Book.exists({ _id: bookId });
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Book not found.' });
      }
      return res.status(400).json({ success: false, message: 'No copies available for borrowing.' });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    let borrowRecord;
    try {
      borrowRecord = await BorrowRecord.create({
      book: bookId,
      user: req.user._id,
      borrowDate: new Date(),
      dueDate,
      status: 'borrowed',
      });
    } catch (error) {
      await Book.updateOne({ _id: bookId }, { $inc: { availableCopies: 1 } });
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: 'You already have this book borrowed.' });
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: 'Book borrowed successfully.',
      borrowRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while borrowing the book.',
      error: error.message,
    });
  }
};

const getMyBorrowHistory = async (req, res) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Math.min(Number(req.query.limit) > 0 ? Number(req.query.limit) : 10, 100);
    const skip = (page - 1) * limit;
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { user: req.user._id };

    const records = await BorrowRecord.find(query)
      .populate('book', 'title author isbn')
      .populate(isAdmin ? { path: 'user', select: 'name email' } : { path: 'user', select: '_id' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const normalizedRecords = records.map((record) => {
      record.status = resolveBorrowStatus(record);
      return record;
    });

    const total = await BorrowRecord.countDocuments(query);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      records: normalizedRecords,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching borrow history.',
      error: error.message,
    });
  }
};

const getBorrowRecordById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid borrow record ID.' });
    }
    const record = await BorrowRecord.findById(req.params.id).populate('book', 'title author isbn');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found.',
      });
    }

    if (record.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own borrow records.',
      });
    }

    record.status = resolveBorrowStatus(record);

    return res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching borrow record.',
      error: error.message,
    });
  }
};

const updateBorrowRecord = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid borrow record ID.' });
    }
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found.',
      });
    }

    const { dueDate, status } = req.body;
    if (status && !['borrowed', 'returned', 'overdue'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be borrowed, overdue, or returned.' });
    }
    if (dueDate !== undefined) {
      const parsedDueDate = new Date(dueDate);
      if (Number.isNaN(parsedDueDate.getTime())) {
        return res.status(400).json({ success: false, message: 'A valid due date is required.' });
      }
      record.dueDate = parsedDueDate;
    }
    if (status === 'returned' && record.status !== 'returned') {
      const book = await Book.findById(record.book);
      if (!book) return res.status(404).json({ success: false, message: 'Associated book not found.' });
      await Book.updateOne({ _id: book._id, availableCopies: { $lt: book.totalCopies } }, { $inc: { availableCopies: 1 } });
      record.returnDate = new Date();
      record.status = 'returned';
    } else if (['borrowed', 'overdue'].includes(status) && record.status === 'returned') {
      const book = await Book.findOneAndUpdate(
        { _id: record.book, availableCopies: { $gt: 0 } },
        { $inc: { availableCopies: -1 } },
        { new: true }
      );
      if (!book) return res.status(400).json({ success: false, message: 'No copies available to reopen this loan.' });
      record.returnDate = null;
      record.status = 'borrowed';
      if (status === 'borrowed' && dueDate === undefined) {
        record.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      }
    } else if (status) {
      // Overdue is derived from the due date; keep the stored active status consistent.
      record.status = status === 'returned' ? 'returned' : 'borrowed';
    }
    if (status === 'overdue' && record.dueDate >= new Date()) {
      record.dueDate = new Date(Date.now() - 1000);
    }

    await record.save();

    return res.status(200).json({
      success: true,
      message: 'Borrow record updated successfully.',
      record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating borrow record.',
      error: error.message,
    });
  }
};

const deleteBorrowRecord = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid borrow record ID.' });
    }
    const record = await BorrowRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found.',
      });
    }

    if (record.status !== 'returned') {
      await Book.updateOne(
        { _id: record.book, $expr: { $lt: ['$availableCopies', '$totalCopies'] } },
        { $inc: { availableCopies: 1 } }
      );
    }
    await record.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Borrow record deleted successfully.',
      borrowRecordId: req.params.id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting borrow record.',
      error: error.message,
    });
  }
};

const returnBorrowedBook = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid borrow record ID.' });
    }
    const record = await BorrowRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found.',
      });
    }

    if (record.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'This book has already been returned.',
      });
    }

    const isOwner = record.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You cannot return someone else\'s borrowed book.',
      });
    }

    const book = await Book.findById(record.book);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Associated book not found.',
      });
    }

    const updatedRecord = await BorrowRecord.findOneAndUpdate(
      { _id: record._id, status: { $ne: 'returned' } },
      { $set: { status: 'returned', returnDate: new Date() } },
      { new: true }
    );
    if (!updatedRecord) {
      return res.status(400).json({ success: false, message: 'This book has already been returned.' });
    }
    await Book.updateOne(
      { _id: book._id, $expr: { $lt: ['$availableCopies', '$totalCopies'] } },
      { $inc: { availableCopies: 1 } }
    );

    return res.status(200).json({
      success: true,
      message: 'Book returned successfully.',
      record: updatedRecord,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while returning the book.',
      error: error.message,
    });
  }
};

const getStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    const now = new Date();
    const activeLoans = { status: { $ne: 'returned' } };
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const [
      bookTotals,
      totalBooks,
      totalCurrentlyBorrowed,
      totalOverdue,
      totalRegisteredMembers,
      categoryBreakdown,
      monthlyRows,
      popularRows,
      lowStockBooks,
      recentLoans,
    ] = await Promise.all([
      Book.aggregate([{ $group: { _id: null, totalCopies: { $sum: '$totalCopies' }, availableCopies: { $sum: '$availableCopies' } } }]),
      Book.countDocuments(),
      BorrowRecord.countDocuments(activeLoans),
      BorrowRecord.countDocuments({ ...activeLoans, dueDate: { $lt: now } }),
      User.countDocuments({ role: 'member' }),
      Book.aggregate([
        { $group: { _id: { $cond: [{ $or: [{ $eq: ['$category', ''] }, { $eq: ['$category', null] }] }, 'Uncategorized', '$category'] }, bookCount: { $sum: 1 }, totalCopies: { $sum: '$totalCopies' } } },
        { $sort: { bookCount: -1, _id: 1 } },
      ]),
      BorrowRecord.aggregate([
        { $match: { borrowDate: { $gte: monthStart } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$borrowDate', timezone: 'UTC' } }, borrows: { $sum: 1 } } },
      ]),
      BorrowRecord.aggregate([
        { $group: { _id: '$book', borrowCount: { $sum: 1 } } },
        { $sort: { borrowCount: -1 } },
        { $limit: 5 },
        { $lookup: { from: Book.collection.name, localField: '_id', foreignField: '_id', as: 'book' } },
        { $unwind: '$book' },
        { $project: { _id: '$book._id', title: '$book.title', author: '$book.author', image: '$book.image', borrowCount: 1 } },
      ]),
      Book.find({ availableCopies: { $lte: 2 } }).select('title author isbn image totalCopies availableCopies').sort({ availableCopies: 1, title: 1 }).limit(6).lean(),
      BorrowRecord.find().populate('book', 'title author').populate('user', 'name email').sort({ borrowDate: -1 }).limit(6).lean(),
    ]);

    const monthlyByKey = new Map(monthlyRows.map((row) => [row._id, row.borrows]));
    const borrowingActivity = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1));
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      return {
        month: key,
        label: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
        borrows: monthlyByKey.get(key) || 0,
      };
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalBooks,
        totalCopies: bookTotals[0]?.totalCopies || 0,
        totalAvailableCopies: bookTotals[0]?.availableCopies || 0,
        totalCurrentlyBorrowed,
        totalOverdue,
        totalRegisteredMembers,
        categoryBreakdown: categoryBreakdown.map(({ _id, ...values }) => ({ category: _id, ...values })),
        borrowingActivity,
        popularBooks: popularRows,
        lowStockBooks,
        recentLoans,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching stats.',
      error: error.message,
    });
  }
};

module.exports = {
  borrowBook,
  getMyBorrowHistory,
  getBorrowRecordById,
  updateBorrowRecord,
  deleteBorrowRecord,
  returnBorrowedBook,
  getStats,
};
