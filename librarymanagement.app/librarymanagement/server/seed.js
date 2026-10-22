const bcrypt = require('bcrypt');
const User = require('./models/User');
const Book = require('./models/Book');

const coverForIsbn = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

const sampleBooks = [
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '9780061122411',
    category: 'Fiction',
    description:
      'A deeply spiritual and inspiring journey about following your dreams, overcoming fear, and discovering your true purpose in life.',
    totalCopies: 5,
    image: coverForIsbn('9780061122411'),
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '9780735211292',
    category: 'Technology',
    description:
      'A practical and highly motivating guide to building powerful routines and transforming small daily actions into lasting success.',
    totalCopies: 4,
    image: coverForIsbn('9780735211292'),
  },
  {
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '9780141439518',
    category: 'Classic',
    description:
      'A timeless novel of wit, romance, and social ambition, following Elizabeth Bennet as she navigates love and pride in Regency England.',
    totalCopies: 3,
    image: coverForIsbn('9780141439518'),
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andy Hunt',
    isbn: '9780201616224',
    category: 'Technology',
    description:
      'A classic software engineering manual filled with real-world wisdom on writing better code, adopting discipline, and growing as a developer.',
    totalCopies: 6,
    image: coverForIsbn('9780201616224'),
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '9780261102217',
    category: 'Fantasy',
    description:
      'A charming and adventurous tale of Bilbo Baggins, who steps beyond his comfort zone to uncover courage, friendship, and wonder in Middle-earth.',
    totalCopies: 4,
    image: coverForIsbn('9780261102217'),
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    category: 'Technology',
    description:
      'A developer-focused book about writing readable, maintainable, and elegant code that stands the test of time and teamwork.',
    totalCopies: 5,
    image: coverForIsbn('9780132350884'),
  },
  {
    title: 'The Secret Garden',
    author: 'Frances Hodgson Burnett',
    isbn: '9781447495852',
    category: 'Classic',
    description:
      'A tender and magical story of healing, friendship, and rediscovery set in a hidden garden that transforms a lonely child’s life.',
    totalCopies: 4,
    image: coverForIsbn('9781447495852'),
  },
  {
    title: 'Deep Work',
    author: 'Cal Newport',
    isbn: '9781455586691',
    category: 'Technology',
    description:
      'A powerful productivity book about focusing without distraction, cultivating deep concentration, and producing meaningful work.',
    totalCopies: 5,
    image: coverForIsbn('9781455586691'),
  },
  {
    title: 'Harry Potter and the Sorcerer\'s Stone',
    author: 'J.K. Rowling',
    isbn: '9780590353427',
    category: 'Fantasy',
    description:
      'An enchanting introduction to Harry Potter, where magic, mystery, and courage unfold in a school full of hidden secrets.',
    totalCopies: 6,
    image: coverForIsbn('9780590353427'),
  },
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    isbn: '9780857197689',
    category: 'Technology',
    description:
      'A thoughtful and accessible look at how behavior, patience, and perspective shape financial decisions in everyday life.',
    totalCopies: 5,
    image: coverForIsbn('9780857197689'),
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '9780061120084',
    category: 'Classic',
    description:
      'A powerful story of compassion, justice, and moral courage seen through the eyes of a child growing up in a divided town.',
    totalCopies: 4,
    image: coverForIsbn('9780061120084'),
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    isbn: '9780307887894',
    category: 'Technology',
    description:
      'A breakthrough book on building products through constant learning, experimentation, and rapid adaptation to customer needs.',
    totalCopies: 5,
    image: coverForIsbn('9780307887894'),
  },
  {
    title: 'The Silent Patient',
    author: 'Alex Michaelides',
    isbn: '9781250301697',
    category: 'Mystery',
    description:
      'A gripping psychological thriller about obsession, silence, and the dangerous layers beneath a seemingly perfect story.',
    totalCopies: 4,
    image: coverForIsbn('9781250301697'),
  },
  {
    title: 'Educated',
    author: 'Tara Westover',
    isbn: '9780399590504',
    category: 'Biography',
    description:
      'A powerful memoir on self-discovery, resilience, and the transformative force of education and courage.',
    totalCopies: 5,
    image: coverForIsbn('9780399590504'),
  },
  {
    title: 'The Martian',
    author: 'Andy Weir',
    isbn: '9780804139021',
    category: 'Science Fiction',
    description:
      'A witty, survival-driven adventure that turns scientific problem-solving into a thrilling story of hope and ingenuity.',
    totalCopies: 6,
    image: coverForIsbn('9780804139021'),
  },
];

const seedDatabase = async () => {
  try {
    let adminUser = await User.findOne({ email: 'admin@libraryapp.com' });

    if (!adminUser) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      adminUser = await User.create({
        name: 'Library Admin',
        email: 'admin@libraryapp.com',
        password: adminPassword,
        role: 'admin',
      });
      console.log('Default admin user created: admin@libraryapp.com / admin123');
    }

    const existingBooks = await Book.find({}, 'isbn');
    const existingIsbns = new Set(existingBooks.map((book) => book.isbn));
    const booksToInsert = sampleBooks
      .filter((book) => !existingIsbns.has(book.isbn))
      .map((book) => ({
        ...book,
        image: book.image || coverForIsbn(book.isbn),
        availableCopies: book.totalCopies,
        addedBy: adminUser._id,
      }));

    if (booksToInsert.length > 0) {
      await Book.insertMany(booksToInsert);
      console.log(`Inserted ${booksToInsert.length} sample books into the database.`);
    } else {
      console.log('Sample books already exist in the database.');
    }
  } catch (error) {
    console.error('Seed database error:', error.message);
  }
};

module.exports = { seedDatabase, sampleBooks };
