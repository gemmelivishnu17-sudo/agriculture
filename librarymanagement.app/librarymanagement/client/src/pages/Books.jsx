import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookCategories, getBooks } from '../services/bookService';
import BookCover from '../components/BookCover';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBooks = async () => {
    setLoading(true);

    try {
      const params = {
        page,
        limit,
        q: appliedSearch || undefined,
        category: category || undefined,
        available: availableOnly ? 'true' : undefined,
      };

      const data = await getBooks(params);
      setBooks(data.books || []);
      setTotalPages(data.totalPages || 1);
      setError('');
    } catch (error) {
      console.error('Failed to load books', error);
      setError(error.response?.data?.message || 'Could not load books from the library catalog.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, category, availableOnly, appliedSearch]);

  useEffect(() => {
    getBookCategories()
      .then((data) => setCategories(data.categories || []))
      .catch((loadError) => console.error('Failed to load book categories', loadError));
  }, []);

  const handleSearch = async () => {
    setPage(1);
    setAppliedSearch(search.trim());
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="books-hero mb-8 overflow-hidden rounded-[28px] border border-[#c7d4c2] bg-gradient-to-r from-[#f9f5f0] via-[#f2eee7] to-[#e7e0d6] p-6 shadow-[0_25px_60px_rgba(68,82,72,0.08)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#3c5d56]">Library home</p>
            <h1 className="text-3xl font-black tracking-tight text-[#1f2d2b] md:text-5xl">Discover Your Next Favorite Book</h1>
            <p className="mt-3 max-w-lg text-sm text-[#536963] md:text-base">Browse the catalog, explore categories, and find standout reads that match your taste and curiosity.</p>
          </div>

          <div className="flex w-full max-w-xl flex-col gap-2 md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') handleSearch(); }}
              placeholder="Search by title or author"
              className="flex-1 rounded-2xl border border-[#d9d0c3] bg-[#fffdfb] px-4 py-3 text-[#1f2d2b] outline-none shadow-inner placeholder:text-[#667b76] focus:border-[#405c52] focus:ring-2 focus:ring-[#405c52]/10"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-2xl bg-gradient-to-r from-[#1d3b36] via-[#3a5a52] to-[#d7a85d] px-5 py-3 font-semibold text-[#fffaf5] shadow-[0_12px_24px_rgba(29,59,54,0.16)] transition hover:-translate-y-0.5"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#d9d0c3] bg-[#fffdfb]/85 p-4 shadow-[0_10px_30px_rgba(64,92,82,0.06)] md:flex-row md:items-center md:justify-between">
        <select
          value={category}
          onChange={(e) => { setPage(1); setCategory(e.target.value); }}
          className="rounded-xl border border-[#d9d0c3] bg-[#f8f4ef] px-3 py-2.5 text-[#1f2d2b] outline-none focus:border-[#405c52]"
        >
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        <label className="flex items-center gap-2 text-sm font-medium text-[#33463f]">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => { setPage(1); setAvailableOnly(e.target.checked); }}
            className="h-4 w-4 accent-[#d4af75]"
          />
          Available only
        </label>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#d4af75]/15 bg-[#171214]/80 p-6 text-center text-[#d7c7b4] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-[#d4af75]/15 bg-[#171214]/80 p-6 text-center text-[#d7c7b4] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">No books found.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <div key={book._id} className="book-grid-item group overflow-hidden rounded-2xl border border-[#d9d0c3] bg-[#fffdfb] shadow-[0_12px_30px_rgba(64,92,82,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#405c52]/20">
              <div className="overflow-hidden border-b border-[#d9d0c3] bg-[#f3efe9]">
                <BookCover book={book} className="h-64 w-full object-contain p-4 transition duration-300 group-hover:scale-[1.03]" />
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-[#1f2d2b]">{book.title}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    book.availableCopies > 0
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-red-500/15 text-red-300'
                  }`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Out of stock'}
                  </span>
                </div>

                <p className="text-[#536963]">by {book.author}</p>
                <div className="mt-3 inline-flex rounded-full bg-gradient-to-r from-[#dfe9df] to-[#eadcc0] px-2.5 py-1 text-xs font-semibold text-[#1f2d2b]">
                  {book.category || 'General'}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#d9d0c3] pt-4">
                  <Link to={`/books/${book._id}`} className="font-semibold text-[#1d3b36] hover:text-[#16352f]">
                    View details
                  </Link>
                  <span className="text-xs text-[#536963]">ISBN: {book.isbn}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p role="alert" className="mt-4 rounded-2xl border border-red-300/25 bg-red-500/10 p-4 text-sm text-red-200">{error}</p>}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="rounded-xl border border-[#d4af75]/20 bg-[#171214] px-3 py-2 text-sm font-medium text-[#f3e9d8] shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-[#f3e9d8]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="rounded-xl border border-[#d4af75]/20 bg-[#171214] px-3 py-2 text-sm font-medium text-[#f3e9d8] shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Books;
