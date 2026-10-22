import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await login(form.email.trim(), form.password);
      const destination = location.state?.from?.pathname || (response.user.role === 'admin' ? '/admin/stats' : '/dashboard');
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="library-pattern book-login flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
      <div className="login-layout grid w-full max-w-6xl overflow-hidden rounded-[32px] lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="login-story relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
          <div className="relative z-10 flex items-center gap-3 text-lg font-bold tracking-wide text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-teal-400 to-violet-400 text-xl text-[#0b1020]">✦</span>
            <span>Library<span className="text-cyan-300">House</span></span>
          </div>

          <div className="relative z-10 max-w-lg pb-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-cyan-200">Your reading room awaits</p>
            <h1 className="text-6xl font-semibold leading-[0.95] text-white xl:text-7xl">A good book takes you somewhere.</h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-slate-200/80">Sign in to borrow from the collection, follow your due dates, and keep your next favorite close at hand.</p>
            <div className="mt-9 flex flex-wrap gap-3 text-sm font-medium text-white/90">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Curated collection</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">Simple borrowing</span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-slate-300/75">
            <span>Find a little wonder between the covers.</span>
            <span>EST. 2024</span>
          </div>
        </section>

        <div className="login-form-side flex items-center justify-center p-4 sm:p-8 lg:p-10">
        <div className="book-login-card w-full max-w-md overflow-hidden rounded-[28px] p-8 sm:p-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6a4328] hover:text-[#4c2e1d]">
            <span aria-hidden="true">←</span>
            Home
          </Link>
          <span className="rounded-full border border-[#c79a52]/40 bg-[#f8edd9] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#7b5129]">
            Members portal
          </span>
        </div>

        <div className="book-login-mark mb-7 flex items-center justify-center">
          <div className="book-login-icon flex h-16 w-12 items-center justify-center text-2xl">
            📖
          </div>
        </div>

        <p className="book-login-kicker mb-2 text-center text-xs font-semibold uppercase">The reading room</p>
        <h2 className="book-login-title mb-2 text-center text-5xl font-semibold italic">Welcome back</h2>
        <p className="book-login-subtitle mb-7 text-center text-sm">Login to continue your reading journey</p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="book-login-label mb-1.5 block text-sm font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="book-login-input w-full rounded-xl px-3.5 py-3 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="book-login-label mb-1.5 block text-sm font-semibold">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="book-login-input w-full rounded-xl px-3.5 py-3 outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="book-login-button w-full rounded-xl px-4 py-3 font-semibold transition hover:-translate-y-0.5"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="book-login-footer mt-6 text-center text-sm">
          Don’t have an account?{' '}
          <Link to="/register" className="book-login-link font-bold italic">
            Register here
          </Link>
        </p>
      </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
