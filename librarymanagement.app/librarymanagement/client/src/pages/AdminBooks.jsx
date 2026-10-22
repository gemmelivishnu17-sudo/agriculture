import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createBook, deleteBook, getBooks, updateBook } from '../services/bookService';
import BookCover from '../components/BookCover';

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  category: '',
  description: '',
  image: '',
  totalCopies: 1,
};

const AdminBooks = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin only.');
      return;
    }

    fetchBooks();
  }, [user]);

  const fetchBooks = async () => {
    try {
      const data = await getBooks({ page: 1, limit: 20 });
      setBooks(data.books || []);
    } catch (err) {
      setError('Failed to load books.');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-600">
        Access denied. Admin only.
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await updateBook(editingId, form);
      } else {
        await createBook(form);
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save book.');
    }
  };

  const handleEdit = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category || '',
      description: book.description || '',
      image: book.image || '',
      totalCopies: book.totalCopies,
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteBook(id);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete book.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <div className="overflow-hidden rounded-[30px] border border-violet-200/80 bg-gradient-to-r from-violet-100 via-indigo-100 to-sky-100 p-6 shadow-[0_18px_34px_rgba(99,102,241,0.12)]">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-violet-800">Catalog management</p>
        <h1 className="text-4xl text-slate-800 md:text-5xl">Manage Books</h1>
      </div>

      <div className="book-card rounded-[28px] p-6">
        {error && <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            required
          />
          <input
            name="author"
            value={form.author}
            onChange={handleChange}
            placeholder="Author"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            required
          />
          <input
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            placeholder="ISBN"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            required
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
          <input
            name="totalCopies"
            type="number"
            min="1"
            value={form.totalCopies}
            onChange={handleChange}
            placeholder="Total copies"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            required
          />
          <input
            name="image"
            type="url"
            value={form.image}
            onChange={handleChange}
            placeholder="Book cover image URL (optional)"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
          />
          {form.image && (
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <img src={form.image} alt="Cover preview" className="h-24 w-16 rounded object-cover" onError={(event) => { event.currentTarget.src = '/book-cover-placeholder.svg'; }} />
              <span className="text-sm font-medium text-slate-600">Cover preview</span>
            </div>
          )}
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            rows="3"
          />

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
            >
              {editingId ? 'Update Book' : 'Add Book'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="book-card overflow-hidden rounded-[28px] p-6">
        <h2 className="mb-4 text-3xl font-bold text-slate-800">Books List</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
              <tr>
                <th className="p-4 font-semibold">Cover</th>
                <th className="p-4 font-semibold">Title</th>
                <th className="p-4 font-semibold">Author</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Copies</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book._id} className="border-t border-slate-200 bg-white/60 transition hover:bg-slate-50/80">
                  <td className="p-3"><BookCover book={book} className="h-16 w-12 rounded object-cover" /></td>
                  <td className="p-4 font-medium text-slate-800">{book.title}</td>
                  <td className="p-4 text-slate-700">{book.author}</td>
                  <td className="p-4 text-slate-700">{book.category || 'General'}</td>
                  <td className="p-4 text-slate-700">{book.availableCopies}/{book.totalCopies}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(book)}
                        className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-amber-200 transition hover:-translate-y-0.5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book._id)}
                        className="rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:-translate-y-0.5"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBooks;
