const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateBookInput = ({ title, author, isbn, totalCopies }) => {
  if (!title || !author || !isbn || totalCopies === undefined || totalCopies === null) {
    return 'Title, author, isbn, and totalCopies are required.';
  }

  if (Number(totalCopies) < 1) {
    return 'totalCopies must be at least 1.';
  }

  return null;
};

const normalizeBookPayload = (bookData, existingBook = null) => {
  const title = typeof bookData.title === 'string' ? bookData.title.trim() : existingBook?.title;
  const author = typeof bookData.author === 'string' ? bookData.author.trim() : existingBook?.author;
  const isbn = typeof bookData.isbn === 'string' ? bookData.isbn.trim() : existingBook?.isbn;
  const category = typeof bookData.category === 'string' ? bookData.category.trim() : existingBook?.category || '';
  const description = typeof bookData.description === 'string' ? bookData.description : existingBook?.description || '';
  const image = typeof bookData.image === 'string' ? bookData.image.trim() : existingBook?.image || '';
  const totalCopies = bookData.totalCopies !== undefined ? Number(bookData.totalCopies) : existingBook?.totalCopies;

  return {
    title,
    author,
    isbn,
    category,
    description,
    image,
    totalCopies,
  };
};

const createBook = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    const { title, author, isbn, category, description, image, totalCopies } = req.body;
    const cleanBook = normalizeBookPayload({ title, author, isbn, category, description, image, totalCopies });
    const validationError = validateBookInput(cleanBook);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingBook = await Book.findOne({ isbn: cleanBook.isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'A book with this ISBN already exists.',
      });
    }

    const newBook = await Book.create({
      title: cleanBook.title,
      author: cleanBook.author,
      isbn: cleanBook.isbn,
      category: cleanBook.category,
      description: cleanBook.description,
      image: cleanBook.image || '',
      totalCopies: Number(cleanBook.totalCopies),
      availableCopies: Number(cleanBook.totalCopies),
      addedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Book created successfully.',
      book: newBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while creating the book.',
      error: error.message,
    });
  }
};

const getBooks = async (req, res) => {
  try {
    const page = Number.isInteger(Number(req.query.page)) && Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Math.min(Number.isInteger(Number(req.query.limit)) && Number(req.query.limit) > 0 ? Number(req.query.limit) : 10, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (q) {
      const expression = { $regex: escapeRegex(q), $options: 'i' };
      filter.$or = [
        { title: expression },
        { author: expression },
        { isbn: expression },
      ];
    }

    if (req.query.category) {
      filter.category = { $regex: `^${escapeRegex(String(req.query.category).trim())}$`, $options: 'i' };
    }

    if (req.query.author) {
      filter.author = { $regex: escapeRegex(String(req.query.author).trim()), $options: 'i' };
    }

    if (req.query.available === 'true') {
      filter.availableCopies = { $gt: 0 };
    }

    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('addedBy', 'name email');

    const total = await Book.countDocuments(filter);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      books,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching books.',
      error: error.message,
    });
  }
};

const getBookCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category', { category: { $nin: ['', null] } });
    return res.status(200).json({ success: true, categories: categories.sort((a, b) => a.localeCompare(b)) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error while fetching book categories.' });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name email');

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    return res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching the book.',
      error: error.message,
    });
  }
};

const updateBook = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    const { title, author, isbn, category, description, image, totalCopies } = req.body;

    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    if (title || author || isbn || totalCopies !== undefined) {
      const validationError = validateBookInput({
        title: title || existingBook.title,
        author: author || existingBook.author,
        isbn: isbn || existingBook.isbn,
        totalCopies: totalCopies !== undefined ? totalCopies : existingBook.totalCopies,
      });

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }
    }

    if (isbn && isbn !== existingBook.isbn) {
      const duplicateBook = await Book.findOne({ isbn: isbn.trim() });
      if (duplicateBook && duplicateBook._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'A book with this ISBN already exists.',
        });
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title: title ? title.trim() : existingBook.title,
        author: author ? author.trim() : existingBook.author,
        isbn: isbn ? isbn.trim() : existingBook.isbn,
        category: category !== undefined ? category.trim() : existingBook.category,
        description: description !== undefined ? description : existingBook.description,
        image: image !== undefined ? image.trim() : existingBook.image,
        totalCopies:
          totalCopies !== undefined ? Number(totalCopies) : existingBook.totalCopies,
        availableCopies:
          totalCopies !== undefined
            ? Math.max(0, Number(totalCopies) - (existingBook.totalCopies - existingBook.availableCopies))
            : existingBook.availableCopies,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully.',
      book: updatedBook,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating the book.',
      error: error.message,
    });
  }
};

const deleteBook = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.',
      });
    }

    const activeBorrow = await BorrowRecord.exists({ book: book._id, status: { $ne: 'returned' } });
    if (activeBorrow) {
      return res.status(409).json({
        success: false,
        message: 'This book has active loans. Return all copies before deleting it.',
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully.',
      bookId: req.params.id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting the book.',
      error: error.message,
    });
  }
};

const searchBooks = async (req, res) => {
  return getBooks(req, res);
};

module.exports = {
  createBook,
  getBooks,
  getBookCategories,
  getBookById,
  updateBook,
  deleteBook,
  searchBooks,
};
