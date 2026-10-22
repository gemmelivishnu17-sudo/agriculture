import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats');
        setStats(response.data.stats);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchStats();
    } else {
      setError('Access denied. Admin only.');
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-600">Access denied. Admin only.</div>;
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading stats...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  const cards = [
    { label: 'Book titles', value: stats?.totalBooks ?? 0 },
    { label: 'Total copies', value: stats?.totalCopies ?? 0 },
    { label: 'Available copies', value: stats?.totalAvailableCopies ?? 0 },
    { label: 'Active loans', value: stats?.totalCurrentlyBorrowed ?? 0 },
    { label: 'Overdue loans', value: stats?.totalOverdue ?? 0 },
    { label: 'Members', value: stats?.totalRegisteredMembers ?? 0 },
  ];
  const maxMonthly = Math.max(1, ...(stats?.borrowingActivity || []).map((item) => item.borrows));
  const maxCategory = Math.max(1, ...(stats?.categoryBreakdown || []).map((item) => item.bookCount));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 overflow-hidden rounded-[28px] border border-[#cfe0d8] bg-gradient-to-r from-[#f9f5f0] via-[#eef1eb] to-[#ece3d7] p-6 shadow-[0_18px_34px_rgba(68,82,72,0.07)]">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#23423d]">Overview</p>
        <h1 className="text-4xl text-[#1f2d2b] md:text-5xl">Library Stats</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="book-card rounded-[24px] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8ce2d1]">{card.label}</p>
            <p className="mt-3 text-4xl font-black text-[#edf5f1]">{Number(card.value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="book-card rounded-[24px] p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8ce2d1]">Circulation</p>
            <h2 className="mt-1 text-3xl font-bold text-[#edf5f1]">Borrowing activity</h2>
            <p className="mt-1 text-sm text-[#b9cbc5]">Loans opened over the last six months</p>
          </div>
          <div className="grid h-48 grid-cols-6 items-end gap-3" role="img" aria-label="Borrowing activity for the last six months">
            {(stats?.borrowingActivity || []).map((item) => (
              <div key={item.month} className="flex h-full flex-col items-center justify-end gap-2">
                <span className="text-xs font-semibold text-[#dce9e4]">{item.borrows}</span>
                <div className="flex h-32 w-full items-end overflow-hidden rounded-t-xl bg-[#102024]">
                  <div className="w-full rounded-t-xl bg-gradient-to-t from-[#318b7e] to-[#8ce2d1] transition-[height] duration-700" style={{ height: `${Math.max(item.borrows > 0 ? 10 : 3, (item.borrows / maxMonthly) * 100)}%` }} />
                </div>
                <span className="text-xs text-[#b9cbc5]">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="book-card rounded-[24px] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8ce2d1]">Collection</p>
          <h2 className="mt-1 text-3xl font-bold text-[#edf5f1]">Titles by category</h2>
          <div className="mt-5 space-y-4">
            {(stats?.categoryBreakdown || []).length === 0 ? <p className="text-sm text-[#b9cbc5]">No category data yet.</p> : (stats.categoryBreakdown || []).map((item) => (
              <div key={item.category}>
                <div className="mb-1 flex justify-between gap-3 text-sm"><span className="text-[#e5efeb]">{item.category}</span><span className="text-[#b9cbc5]">{item.bookCount} titles · {item.totalCopies} copies</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[#102024]"><div className="h-full rounded-full bg-gradient-to-r from-[#318b7e] to-[#8ce2d1]" style={{ width: `${Math.max(3, (item.bookCount / maxCategory) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="book-card rounded-[24px] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8ce2d1]">Reader favorites</p>
          <h2 className="mt-1 text-3xl font-bold text-[#edf5f1]">Most borrowed</h2>
          <div className="mt-4 divide-y divide-[#66d1bf]/10">
            {(stats?.popularBooks || []).length === 0 ? <p className="py-4 text-sm text-[#b9cbc5]">No borrowing activity yet.</p> : (stats.popularBooks || []).map((book, index) => (
              <div key={book._id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#244743] text-sm font-bold text-[#9ce5d6]">{index + 1}</span><div className="min-w-0"><p className="truncate font-semibold text-[#edf5f1]">{book.title}</p><p className="truncate text-xs text-[#b9cbc5]">{book.author}</p></div></div>
                <span className="shrink-0 rounded-full bg-[#244743] px-3 py-1 text-xs font-semibold text-[#9ce5d6]">{book.borrowCount} loans</span>
              </div>
            ))}
          </div>
        </section>

        <section className="book-card rounded-[24px] p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f1a18a]">Stock watch</p>
          <h2 className="mt-1 text-3xl font-bold text-[#edf5f1]">Low availability</h2>
          <div className="mt-4 divide-y divide-[#66d1bf]/10">
            {(stats?.lowStockBooks || []).length === 0 ? <p className="py-4 text-sm text-[#b9cbc5]">All titles have more than two copies available.</p> : (stats.lowStockBooks || []).map((book) => (
              <div key={book._id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0"><p className="truncate font-semibold text-[#edf5f1]">{book.title}</p><p className="text-xs text-[#b9cbc5]">{book.author}</p></div>
                <span className="shrink-0 rounded-full bg-[#633f3d] px-3 py-1 text-xs font-semibold text-[#ffc0a9]">{book.availableCopies} / {book.totalCopies} left</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="book-card mt-6 rounded-[24px] p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8ce2d1]">Latest activity</p>
        <h2 className="mt-1 text-3xl font-bold text-[#edf5f1]">Recent loans</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead><tr><th className="p-3">Member</th><th className="p-3">Book</th><th className="p-3">Borrowed</th><th className="p-3">Due</th><th className="p-3">Status</th></tr></thead>
            <tbody>
              {(stats?.recentLoans || []).length === 0 ? <tr><td colSpan="5" className="p-4 text-center text-[#b9cbc5]">No loans recorded yet.</td></tr> : (stats.recentLoans || []).map((loan) => {
                const overdue = loan.status !== 'returned' && new Date(loan.dueDate) < new Date();
                const status = loan.status === 'returned' ? 'Returned' : overdue ? 'Overdue' : 'Borrowed';
                return <tr key={loan._id} className="border-t border-[#66d1bf]/10"><td className="p-3">{loan.user?.name || 'Unknown member'}</td><td className="p-3">{loan.book?.title || 'Book removed'}</td><td className="p-3">{new Date(loan.borrowDate).toLocaleDateString()}</td><td className="p-3">{new Date(loan.dueDate).toLocaleDateString()}</td><td className="p-3">{status}</td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminStats;
