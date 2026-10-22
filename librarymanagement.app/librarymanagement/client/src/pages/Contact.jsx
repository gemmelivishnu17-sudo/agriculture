import { useState } from 'react';
import { submitContactMessage } from '../services/contactService';

const initialState = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

const Contact = () => {
  const [form, setForm] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSubmitted(false);
    try {
      await submitContactMessage(form);
      setForm(initialState);
      setSubmitted(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 overflow-hidden rounded-[30px] border border-[#d4af75]/20 bg-gradient-to-r from-[#20191c] via-[#171214] to-[#120f12] p-6 shadow-[0_18px_36px_rgba(0,0,0,0.26)]">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-[#d9bb7d]">Contact us</p>
        <h1 className="text-4xl text-[#f8f1e8] md:text-5xl">We’d love to hear from you</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="book-card rounded-[28px] p-6">
          <h2 className="text-3xl font-bold text-[#f8f1e8]">Library Support Desk</h2>
          <p className="mt-3 text-[#d7c7b4]">
            If a visitor wants to join the library, ask for a membership card, report a problem, or request a book recommendation, this is the place to reach us.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-[#d4af75]/15 bg-[#120f12]/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9bb7d]">Phone</p>
              <p className="mt-2 font-semibold text-[#f8f1e8]">+91 98765 43210</p>
            </div>

            <div className="rounded-2xl border border-[#d4af75]/15 bg-[#120f12]/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9bb7d]">Email</p>
              <p className="mt-2 font-semibold text-[#f8f1e8]">support@libraryapp.com</p>
            </div>

            <div className="rounded-2xl border border-[#d4af75]/15 bg-[#120f12]/70 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d9bb7d]">Address</p>
              <p className="mt-2 font-semibold text-[#f8f1e8]">24 Reading Avenue, Knowledge City</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="book-card rounded-[28px] p-6">
          <h2 className="text-3xl font-bold text-[#f8f1e8]">Send a message</h2>

          {submitted && (
            <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Your message has been sent to the library team.
            </div>
          )}
          {error && <p role="alert" className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#f0e3c8]">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#d4af75]/15 bg-[#120f12] px-3.5 py-3 text-[#f7efe4] outline-none transition focus:border-[#d4af75] focus:ring-4 focus:ring-[#d4af75]/10"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#f0e3c8]">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-[#d4af75]/15 bg-[#120f12] px-3.5 py-3 text-[#f7efe4] outline-none transition focus:border-[#d4af75] focus:ring-4 focus:ring-[#d4af75]/10"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-[#f0e3c8]">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[#d4af75]/15 bg-[#120f12] px-3.5 py-3 text-[#f7efe4] outline-none transition focus:border-[#d4af75] focus:ring-4 focus:ring-[#d4af75]/10"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-[#f0e3c8]">Message</label>
            <textarea
              name="message"
              rows="5"
              value={form.message}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[#d4af75]/15 bg-[#120f12] px-3.5 py-3 text-[#f7efe4] outline-none transition focus:border-[#d4af75] focus:ring-4 focus:ring-[#d4af75]/10"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-full bg-gradient-to-r from-[#d4af75] via-[#c79a52] to-[#f3dfae] px-5 py-3 font-semibold text-[#1a1414] shadow-[0_12px_24px_rgba(212,175,117,0.2)] transition hover:-translate-y-0.5"
          >
            {submitting ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
