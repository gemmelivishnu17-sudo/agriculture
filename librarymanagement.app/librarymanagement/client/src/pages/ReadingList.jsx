import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookCover from '../components/BookCover';
import { getReadingList, removeFromReadingList } from '../services/readingListService';

const ReadingList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getReadingList()
      .then((data) => setItems(data.items || []))
      .catch((err) => setError(err.response?.data?.message || 'Could not load your reading list.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (bookId) => {
    setError('');
    try {
      await removeFromReadingList(bookId);
      setItems((current) => current.filter((item) => item.book?._id !== bookId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove this book. Please try again.');
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      <header className="mb-8 rounded-[30px] border border-cyan-200/15 bg-gradient-to-r from-[#203653] via-[#1a2947] to-[#3d2d58] p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">Your collection</p>
        <h1 className="mt-2 text-4xl text-white md:text-5xl">Reading List</h1>
        <p className="mt-3 text-slate-200/80">Keep the books you want to read close at hand.</p>
      </header>

      {error && <p role="alert" className="mb-5 rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4 text-rose-100">{error}</p>}
      {loading ? (
        <p className="book-card rounded-2xl p-6 text-center text-slate-200">Loading your reading list…</p>
      ) : items.length === 0 ? (
        <div className="book-card rounded-[28px] p-10 text-center">
          <p className="text-2xl font-semibold text-white">Your list is ready for a first pick.</p>
          <p className="mt-2 text-slate-300">Save books from their detail pages and they will appear here.</p>
          <Link to="/books" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-teal-400 to-violet-400 px-5 py-3 font-bold text-slate-950">Explore the catalog</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.filter((item) => item.book).map(({ book }) => (
            <article key={book._id} className="book-card overflow-hidden rounded-[26px]">
              <BookCover book={book} className="h-64 w-full bg-[#111b31] object-contain p-5" />
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">{book.category || 'General'}</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{book.title}</h2>
                <p className="mt-1 text-slate-300">by {book.author}</p>
                <p className="mt-3 text-sm text-slate-300">{book.availableCopies > 0 ? `${book.availableCopies} available` : 'Currently unavailable'}</p>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <Link to={`/books/${book._id}`} className="font-semibold text-cyan-200 hover:text-white">View book</Link>
                  <button type="button" onClick={() => handleRemove(book._id)} className="rounded-full border border-rose-300/20 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10">Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default ReadingList;
