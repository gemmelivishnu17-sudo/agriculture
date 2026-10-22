import { useEffect, useState } from 'react';
import { getMyBorrowRecords, returnBorrowedBook } from '../services/borrowService';

const MyBorrows = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRecords = async () => {
    try {
      const response = await getMyBorrowRecords({ page, limit: 10 });
      setRecords(response.records || []);
      setTotalPages(Math.max(response.totalPages || 1, 1));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your borrow history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRecords();
  }, [page]);

  const handleReturn = async (id) => {
    try {
      await returnBorrowedBook(id);
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to return this book.');
    }
  };

  const calculateStatus = (record) => {
    if (record.status === 'returned') {
      return 'returned';
    }

    const dueDate = new Date(record.dueDate);
    const today = new Date();
    if (dueDate < today) {
      return 'overdue';
    }

    return 'borrowed';
  };

  const getDaysLeft = (record) => {
    const dueDate = new Date(record.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const activeLoans = records.filter((record) => calculateStatus(record) === 'borrowed' || calculateStatus(record) === 'overdue').length;
  const overdueCount = records.filter((record) => calculateStatus(record) === 'overdue').length;
  const returnedCount = records.filter((record) => calculateStatus(record) === 'returned').length;
  const dueSoonCount = records.filter((record) => {
    const status = calculateStatus(record);
    return status === 'borrowed' && getDaysLeft(record) <= 3 && getDaysLeft(record) >= 0;
  }).length;

  const filteredRecords = records.filter((record) => {
    const status = calculateStatus(record);
    const matchesStatus = filter === 'all' || filter === status;
    const searchTerm = search.trim().toLowerCase();
    const matchesSearch = !searchTerm ||
      (record.book?.title || '').toLowerCase().includes(searchTerm) ||
      (record.book?.author || '').toLowerCase().includes(searchTerm) ||
      (record.book?.isbn || '').toLowerCase().includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading borrow history...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 overflow-hidden rounded-[28px] border border-[#d4af75]/20 bg-gradient-to-r from-[#20191c] via-[#171214] to-[#120f12] p-6 shadow-[0_18px_36px_rgba(0,0,0,0.26)]">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#d9bb7d]">Reading dashboard</p>
        <h1 className="text-4xl text-[#f8f1e8] md:text-5xl">My Borrowed Books</h1>
        <p className="mt-3 max-w-2xl text-sm text-[#e2d4be] md:text-base">
          Keep track of your active loans, due dates, and return history in one place.
        </p>
      </div>

      {error && <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[#d4af75]/15 bg-[#171214]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9bb7d]">Active loans</p>
          <p className="mt-3 text-3xl font-black text-[#f8f1e8]">{activeLoans}</p>
        </div>
        <div className="rounded-2xl border border-[#d4af75]/15 bg-[#171214]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9bb7d]">Due soon</p>
          <p className="mt-3 text-3xl font-black text-[#f8f1e8]">{dueSoonCount}</p>
        </div>
        <div className="rounded-2xl border border-[#d4af75]/15 bg-[#171214]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9bb7d]">Overdue</p>
          <p className="mt-3 text-3xl font-black text-[#f8f1e8]">{overdueCount}</p>
        </div>
        <div className="rounded-2xl border border-[#d4af75]/15 bg-[#171214]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9bb7d]">Returned</p>
          <p className="mt-3 text-3xl font-black text-[#f8f1e8]">{returnedCount}</p>
        </div>
      </div>

      <div className="mb-8 rounded-[28px] border border-[#d4af75]/15 bg-[#171214]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d9bb7d]">Borrowing tips</p>
            <h2 className="mt-2 text-2xl font-bold text-[#f8f1e8]">Stay on top of your reading schedule</h2>
          </div>
          <div className="rounded-2xl border border-[#d4af75]/15 bg-[#120f12] px-4 py-3 text-sm text-[#e2d4be]">
            Return books before the due date to avoid late notices.
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-[28px] border border-[#d4af75]/15 bg-[#171214]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All books' },
            { key: 'borrowed', label: 'Active' },
            { key: 'overdue', label: 'Overdue' },
            { key: 'returned', label: 'Returned' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === item.key
                  ? 'bg-gradient-to-r from-[#d4af75] via-[#c79a52] to-[#f3dfae] text-[#1a1414] shadow-[0_10px_20px_rgba(212,175,117,0.2)]'
                  : 'border border-[#d4af75]/15 bg-[#120f12] text-[#e2d4be] hover:border-[#d4af75]/35'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="w-full max-w-md">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or ISBN"
            className="w-full rounded-2xl border border-[#d4af75]/15 bg-[#120f12] px-4 py-3 text-[#f7efe4] outline-none placeholder:text-[#d7c7b4] focus:border-[#d4af75] focus:ring-2 focus:ring-[#d4af75]/20"
          />
        </div>
      </div>

      <div className="book-card overflow-hidden rounded-[28px]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-[#d4af75] via-[#c79a52] to-[#f3dfae] text-[#1a1414]">
              <tr>
                <th className="p-4 font-semibold">Book</th>
                <th className="p-4 font-semibold">Author</th>
                <th className="p-4 font-semibold">Borrowed</th>
                <th className="p-4 font-semibold">Due date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-[#d7c7b4]">
                    No matching borrow records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => {
                  const status = calculateStatus(record);
                  const daysLeft = getDaysLeft(record);

                  return (
                    <tr key={record._id} className="border-t border-[#d4af75]/10 bg-[#120f12]/60 transition hover:bg-[#171214]">
                      <td className="p-4">
                        <div className="font-semibold text-[#f8f1e8]">{record.book?.title || 'Unknown book'}</div>
                        <div className="mt-1 text-xs text-[#d7c7b4]">ISBN: {record.book?.isbn || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-[#d7c7b4]">{record.book?.author || 'Unknown author'}</td>
                      <td className="p-4 text-[#d7c7b4]">{new Date(record.borrowDate).toLocaleDateString()}</td>
                      <td className="p-4 text-[#d7c7b4]">
                        <div>{new Date(record.dueDate).toLocaleDateString()}</div>
                        {status === 'borrowed' && (
                          <div className="mt-1 text-xs text-[#f3dfae]">{daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days late`}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                            status === 'borrowed'
                              ? 'bg-yellow-500/15 text-yellow-200'
                              : status === 'overdue'
                                ? 'bg-red-500/15 text-red-200'
                                : 'bg-emerald-500/15 text-emerald-200'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="p-4">
                        {status === 'returned' ? (
                          <span className="text-sm font-medium text-[#d7c7b4]">
                            Returned on {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : '—'}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleReturn(record._id)}
                            className="rounded-full bg-gradient-to-r from-[#d4af75] via-[#c79a52] to-[#f3dfae] px-3 py-2 text-sm font-semibold text-[#1a1414] shadow-[0_10px_20px_rgba(212,175,117,0.2)] transition hover:-translate-y-0.5"
                          >
                            Return book
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Borrow history pages" className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={page === 1 || loading}
            className="rounded-xl border border-[#d4af75]/20 bg-[#171214] px-4 py-2 text-sm font-semibold text-[#f3e9d8] transition hover:border-[#e9ec72]/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span aria-live="polite" className="text-sm font-medium text-[#f3f1dc]">Page {page} of {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
            disabled={page === totalPages || loading}
            className="rounded-xl border border-[#d4af75]/20 bg-[#171214] px-4 py-2 text-sm font-semibold text-[#f3e9d8] transition hover:border-[#e9ec72]/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
};

export default MyBorrows;
