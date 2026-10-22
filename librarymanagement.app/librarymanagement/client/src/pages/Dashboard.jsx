import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyBorrowRecords } from '../services/borrowService';

const Dashboard = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        const response = await getMyBorrowRecords({ page: 1, limit: 50 });
        const active = (response.records || []).filter((record) => record.status === 'borrowed');
        setRecords(active);
      } catch (error) {
        console.error('Failed to fetch borrowed books', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 overflow-hidden rounded-[30px] border border-[#ccd8cf] bg-gradient-to-r from-[#f9f5f0] via-[#f3eee6] to-[#e8e0d5] p-6 shadow-[0_24px_40px_rgba(68,82,72,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.32em] text-[#3c5d56]">Library dashboard</p>
            <h1 className="text-4xl text-[#1f2d2b] md:text-5xl">Welcome back, {user?.name || 'Reader'}!</h1>
          </div>

          <div className="flex items-center gap-3 rounded-full border border-[#b5c6b7] bg-[#fffdfb] px-4 py-2 text-sm font-medium text-[#25443e] shadow-sm">
            <span className="text-lg">📖</span>
            Reading log active
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="book-card rounded-[24px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3c5d56]">Borrowed</p>
          <p className="mt-3 text-4xl font-black text-[#1f2d2b]">{loading ? '...' : records.length}</p>
        </div>
        <div className="book-card rounded-[24px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5b6d64]">Available</p>
          <p className="mt-3 text-2xl font-black text-[#1f2d2b]">Explore catalog</p>
        </div>
        <div className="book-card rounded-[24px] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7b5a32]">Action</p>
          <p className="mt-3 text-xl font-black text-[#1f2d2b]">Manage your loans</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="book-card rounded-[24px] p-6">
          <h2 className="text-3xl font-bold text-[#1f2d2b]">Your current loans</h2>
          {records.length === 0 ? (
            <p className="mt-4 text-[#536963]">You do not currently have any borrowed books.</p>
          ) : (
            <ul className="mt-5 space-y-3">
              {records.map((record) => (
                <li key={record._id} className="rounded-2xl border border-[#d9d0c3] bg-[#f8f4ef] p-3 text-[#1f2d2b] shadow-sm">
                  {record.book?.title || 'Book title unavailable'}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="book-card rounded-[24px] p-6">
          <h2 className="text-3xl font-bold text-[#1f2d2b]">Quick links</h2>

          <div className="mt-5 space-y-3">
            <Link to="/books" className="block rounded-2xl bg-gradient-to-r from-[#d4af75] via-[#b78a42] to-[#f3dfae] px-4 py-3 text-center font-semibold text-[#1a1414] shadow-[0_12px_24px_rgba(212,175,117,0.2)] transition hover:-translate-y-0.5">
              Browse Books
            </Link>
            <Link to="/my-borrows" className="block rounded-2xl border border-[#d4af75]/20 bg-[#f5e9d8]/5 px-4 py-3 text-center font-semibold text-[#f4ebdf] transition hover:border-[#d4af75]/40 hover:text-[#fff8ee]">
              My Borrow History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
