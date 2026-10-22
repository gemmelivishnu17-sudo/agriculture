import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookById } from '../services/bookService';
import { borrowBook } from '../services/borrowService';
import { addToReadingList, getReadingList, removeFromReadingList } from '../services/readingListService';
import BookCover from '../components/BookCover';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await getBookById(id);
        setBook(response.book);
      } catch (err) {
        setError('Failed to load book details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    let active = true;
    if (isAuthenticated) {
      getReadingList()
        .then((data) => {
          if (active) setSaved((data.items || []).some((item) => item.book?._id === id));
        })
        .catch(() => {});
    } else {
      setSaved(false);
    }
    return () => { active = false; };
  }, [id, isAuthenticated]);

  const handleBorrow = async () => {
    try {
      await borrowBook(id);
      const refreshedBook = await getBookById(id);
      setBook(refreshedBook.book);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to borrow this book.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (saved) {
        await removeFromReadingList(id);
        setSaved(false);
      } else {
        await addToReadingList(id);
        setSaved(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update your reading list.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading book...</div>;
  }

  if (error || !book) {
    return <div className="p-8 text-center text-red-600">{error || 'Book not found.'}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="book-card rounded-[30px] p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <div className="overflow-hidden rounded-[26px] border border-[#d4af75]/25 bg-[#1d1517] shadow-[0_18px_40px_rgba(249,115,22,0.16)]">
            <BookCover book={book} className="h-[360px] w-full object-contain p-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#355349]">Featured title</p>
            <h1 className="mt-2 text-5xl font-bold text-[#1f2d2b]">{book.title}</h1>
            <p className="mt-3 text-xl text-[#536963]">by {book.author}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#d9d0c3] bg-[#f8f4ef] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#536963]">ISBN</p>
                <p className="mt-2 font-semibold text-[#1f2d2b]">{book.isbn}</p>
              </div>
              <div className="rounded-2xl border border-[#d9d0c3] bg-[#f8f4ef] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#536963]">Category</p>
                <p className="mt-2 font-semibold text-[#1f2d2b]">{book.category || 'General'}</p>
              </div>
              <div className="rounded-2xl border border-[#d9d0c3] bg-[#f8f4ef] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#536963]">Total copies</p>
                <p className="mt-2 font-semibold text-[#1f2d2b]">{book.totalCopies}</p>
              </div>
              <div className="rounded-2xl border border-[#d9d0c3] bg-[#f8f4ef] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#536963]">Available</p>
                <p className="mt-2 font-semibold text-[#1f2d2b]">{book.availableCopies}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-[#d9d0c3] bg-gradient-to-r from-[#f8f4ef] to-[#f1ece6] p-5 text-[#425b57]">
              <h2 className="mb-2 text-2xl font-bold text-[#1f2d2b]">Description</h2>
              <p className="leading-7">{book.description || 'No description available.'}</p>
            </div>

            {isAuthenticated && book.availableCopies > 0 && (
              <button
                onClick={handleBorrow}
                className="mt-6 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5"
              >
                Borrow this book
              </button>
            )}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="mt-6 ml-3 rounded-full border border-cyan-200/25 bg-cyan-300/10 px-6 py-3.5 font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-60"
              >
                {saving ? 'Saving…' : saved ? 'Remove from reading list' : 'Save to reading list'}
              </button>
            )}

            {!isAuthenticated && book.availableCopies > 0 && (
              <Link
                to="/login"
                state={{ from: location }}
                className="mt-6 inline-flex rounded-full bg-gradient-to-r from-[#1d3b36] via-[#3a5a52] to-[#d7a85d] px-6 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                Sign in to borrow
              </Link>
            )}

            {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
