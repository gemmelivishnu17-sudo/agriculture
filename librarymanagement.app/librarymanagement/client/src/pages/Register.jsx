import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="library-pattern book-login flex min-h-screen items-center justify-center px-4 py-10">
      <div className="book-login-card w-full max-w-md overflow-hidden rounded-[32px] p-8 backdrop-blur-sm">
        <div className="mb-7 flex items-center justify-center">
          <div className="book-login-icon flex h-14 w-14 items-center justify-center rounded-2xl text-2xl">
            ✨
          </div>
        </div>

        <h2 className="book-login-title mb-2 text-center text-4xl font-bold">Create account</h2>
        <p className="book-login-subtitle mb-6 text-center text-sm">Join the library community</p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="book-login-label mb-1.5 block text-sm font-semibold">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="book-login-input w-full rounded-xl px-3.5 py-3 outline-none transition"
              required
            />
          </div>

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
            className="book-login-button w-full rounded-xl px-4 py-3 font-semibold transition hover:-translate-y-0.5"
          >
            Register
          </button>
        </form>

        <p className="book-login-footer mt-5 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="book-login-link font-bold">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
