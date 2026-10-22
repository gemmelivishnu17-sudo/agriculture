import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  deleteBorrowRecord,
  getMyBorrowRecords,
  updateBorrowRecord,
} from '../services/borrowService';

const AdminBorrows = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin only.');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchRecords();
  }, [user, page]);

  const fetchRecords = async () => {
    try {
      const response = await getMyBorrowRecords({ page, limit: 10 });
      setRecords(response.records || []);
      setTotalPages(Math.max(response.totalPages || 1, 1));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load borrow records.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateBorrowRecord(id, { status });
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update borrow record.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBorrowRecord(id);
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete borrow record.');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-600">Access denied. Admin only.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading borrow records...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 overflow-hidden rounded-[28px] border border-rose-200/80 bg-gradient-to-r from-rose-100 via-orange-100 to-amber-100 p-6 shadow-[0_18px_34px_rgba(251,146,60,0.12)]">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-rose-800">Borrow overview</p>
        <h1 className="text-4xl text-slate-800 md:text-5xl">All Borrow Records</h1>
      </div>

      {error && <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="book-card overflow-hidden rounded-[28px]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-slate-900 to-slate-700 text-white">
              <tr>
                <th className="p-4 font-semibold">Member</th>
                <th className="p-4 font-semibold">Book</th>
                <th className="p-4 font-semibold">Borrow Date</th>
                <th className="p-4 font-semibold">Due Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500">
                    No borrow records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id} className="border-t border-slate-200 bg-white/60 transition hover:bg-slate-50/80">
                    <td className="p-4 font-medium text-slate-800">{record.user?.name || 'Unknown user'}</td>
                    <td className="p-4 text-slate-700">{record.book?.title || 'Unknown book'}</td>
                    <td className="p-4 text-slate-600">{new Date(record.borrowDate).toLocaleDateString()}</td>
                    <td className="p-4 text-slate-600">{new Date(record.dueDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <select
                        value={record.status}
                        onChange={(e) => handleStatusChange(record._id, e.target.value)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                      >
                        <option value="borrowed">borrowed</option>
                        <option value="returned">returned</option>
                        <option value="overdue">overdue</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="rounded-full bg-gradient-to-r from-red-500 to-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-red-200 transition hover:-translate-y-0.5"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Borrow record pages" className="mt-6 flex items-center justify-center gap-4">
          <button type="button" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page === 1 || loading} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50">Previous</button>
          <span aria-live="polite" className="text-sm">Page {page} of {totalPages}</span>
          <button type="button" onClick={() => setPage((current) => Math.min(current + 1, totalPages))} disabled={page === totalPages || loading} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50">Next</button>
        </nav>
      )}
    </div>
  );
};

export default AdminBorrows;
