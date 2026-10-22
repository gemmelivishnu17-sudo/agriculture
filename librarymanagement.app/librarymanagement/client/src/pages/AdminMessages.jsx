import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getContactMessages, updateContactMessage } from '../services/contactService';

const AdminMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Access denied. Admin only.');
      setLoading(false);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getContactMessages({ page, limit: 20 });
        setMessages(data.messages || []);
        setTotalPages(Math.max(data.totalPages || 1, 1));
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Failed to load contact messages.');
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [page, user]);

  const handleStatusChange = async (id, status) => {
    setSavingId(id);
    setError('');
    try {
      const data = await updateContactMessage(id, status);
      setMessages((current) => current.map((message) => (
        message._id === id ? data.contactMessage : message
      )));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to update message status.');
    } finally {
      setSavingId('');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-red-600">Access denied. Admin only.</div>;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="books-hero rounded-2xl border p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e9ec9a]">Library support</p>
        <h1 className="mt-2 text-4xl font-bold text-[#f3f1dc]">Contact inbox</h1>
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">{error}</p>}
      {loading ? (
        <p className="book-card rounded-xl p-6 text-center">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="book-card rounded-xl p-6 text-center">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <article key={message._id} className="book-card grid gap-4 rounded-xl p-5 md:grid-cols-[1fr_auto]">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-lg font-semibold text-[#f3f1dc]">{message.name}</h2>
                  <a className="text-sm text-[#e9ec9a] hover:underline" href={`mailto:${message.email}`}>{message.email}</a>
                  {message.phone && <span className="text-sm text-[#cfddc7]">{message.phone}</span>}
                </div>
                <p className="mt-1 text-xs text-[#cfddc7]">{new Date(message.createdAt).toLocaleString()}</p>
                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#f3f1dc]">{message.message}</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="sr-only">Message status</span>
                <select
                  value={message.status}
                  disabled={savingId === message._id}
                  onChange={(event) => handleStatusChange(message._id, event.target.value)}
                  className="rounded-lg border px-3 py-2"
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav aria-label="Contact message pages" className="flex items-center justify-center gap-4">
          <button type="button" disabled={page === 1 || loading} onClick={() => setPage((current) => current - 1)} className="rounded-lg border px-4 py-2 disabled:opacity-50">Previous</button>
          <span aria-live="polite" className="text-sm">Page {page} of {totalPages}</span>
          <button type="button" disabled={page === totalPages || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border px-4 py-2 disabled:opacity-50">Next</button>
        </nav>
      )}
    </main>
  );
};

export default AdminMessages;