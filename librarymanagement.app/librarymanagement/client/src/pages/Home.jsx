import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBooks } from '../services/bookService';
import BookCover from '../components/BookCover';

const pillars = [
  {
    icon: '📚',
    title: 'Smart catalog',
    description: 'Browse by genre, author, and availability with a polished discovery experience.',
  },
  {
    icon: '🧾',
    title: 'Borrow in one click',
    description: 'Keep track of your loans, renewals, and reading history with zero friction.',
  },
  {
    icon: '📊',
    title: 'Library insights',
    description: 'Admin dashboards reveal stock health, demand, and member activity in real time.',
  },
];

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [catalogTotal, setCatalogTotal] = useState(0);

  useEffect(() => {
    document.title = 'Library Management';

    const loadFeaturedBooks = async () => {
      try {
        const data = await getBooks({ page: 1, limit: 3, available: 'true' });
        setFeaturedBooks(data.books || []);
        setCatalogTotal(data.total || 0);
      } catch (error) {
        console.error('Failed to load featured books', error);
      }
    };

    loadFeaturedBooks();
  }, []);

  return (
    <>
    <header className="home-navigation border-b border-white/10 bg-[#10182b]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="home-nav-brand flex items-center gap-3 text-lg font-bold tracking-wide text-white">
          <span className="home-nav-mark flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 via-teal-400 to-violet-400 text-xl text-[#0b1020]">✦</span>
          <span>Library<span className="home-nav-accent text-cyan-300">House</span></span>
        </Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-200">
            <Link to="/books" className="home-nav-link rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-cyan-200">Browse books</Link>
          <Link to="/contact" className="home-nav-link rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-cyan-200">Contact</Link>
          {isAuthenticated ? (
            <Link to={user?.role === 'admin' ? '/admin/stats' : '/dashboard'} className="home-nav-action rounded-full bg-gradient-to-r from-teal-400 to-violet-400 px-5 py-2.5 font-bold text-slate-950 shadow-lg shadow-teal-950/30 transition hover:-translate-y-0.5">
              My library
            </Link>
          ) : (
            <>
              <Link to="/login" className="home-nav-link home-nav-signin rounded-full border border-white/15 px-4 py-2 transition hover:border-cyan-300/50 hover:text-cyan-200">Sign in</Link>
              <Link to="/register" className="home-nav-action rounded-full bg-gradient-to-r from-teal-400 to-violet-400 px-5 py-2.5 font-bold text-slate-950 shadow-lg shadow-teal-950/30 transition hover:-translate-y-0.5">Join the library</Link>
            </>
          )}
        </nav>
      </div>
    </header>
    <div className="home-shell mx-auto max-w-6xl px-4 py-8 md:py-12">
      <section className="home-hero overflow-hidden rounded-[32px] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.35)] md:p-10">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative z-10">
            <div className="home-hero-badge mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.24em]">
              <span>✦</span>
              Library management
            </div>

            <h1 className="home-hero-title text-gradient text-5xl font-black leading-[0.9] md:text-7xl">
              A modern library for curious minds.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-[#465e5a] md:text-lg">
              Discover a refined reading experience with curated collections, seamless borrowing, and a digital library designed for today&apos;s members and teams.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/books"
                className="home-primary-action rounded-full bg-gradient-to-r from-[#1d3b36] via-[#3a5a52] to-[#d7a85d] px-5 py-3 font-semibold text-[#fdfaf5] shadow-[0_12px_24px_rgba(29,59,54,0.18)] transition hover:-translate-y-0.5"
              >
                Explore Books
              </Link>

              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="home-secondary-action rounded-full border border-[#d1ad6b]/30 bg-[#202620] px-5 py-3 font-semibold text-[#eee9dd] shadow-sm transition hover:border-[#d1ad6b]/55"
                >
                  Login
                </Link>
              ) : (
                <Link
                  to={user?.role === 'admin' ? '/admin/books' : '/dashboard'}
                  className="home-secondary-action rounded-full border border-[#d1ad6b]/30 bg-[#202620] px-5 py-3 font-semibold text-[#eee9dd] shadow-sm transition hover:border-[#d1ad6b]/55"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>

            <div className="home-trust mt-7 flex flex-wrap items-center gap-3">
              {[
                { label: 'Books in catalog', value: catalogTotal.toLocaleString() },
                { label: 'Borrow period', value: '14 days' },
                { label: 'Availability', value: 'Live updates' },
              ].map((item) => (
                <div key={item.label} className="home-stat rounded-full border border-[#aebca9]/50 px-3.5 py-2">
                  <span className="block text-[10px] uppercase tracking-[0.24em] text-[#26443f]">{item.label}</span>
                  <span className="mt-1 block text-lg font-semibold text-[#203b39]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="home-visual relative min-h-[390px]">
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80"
              alt="Warm and modern library reading room"
              className="home-library-image absolute inset-0 h-full w-full object-cover"
            />
            <div className="home-visual-shade absolute inset-0" />

            <div className="home-book-cover absolute bottom-7 left-7 flex h-56 w-40 flex-col justify-between p-5 shadow-2xl sm:left-12">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#f6dca8]">Volume I</p>
                <p className="mt-5 text-3xl font-semibold italic leading-none text-[#fff5df]">The quiet art of reading</p>
              </div>
              <div className="h-px w-12 bg-[#e2b56c]" />
            </div>

            <div className="home-status absolute right-5 top-5 p-4 sm:right-7 sm:top-7">
              <div className="flex items-center justify-between gap-6">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f8e9c9]">Library status</span>
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-200">Open</span>
              </div>
              <p className="mt-5 text-2xl font-semibold text-[#fff5df]">Collector&apos;s Picks</p>
              <p className="mt-1 text-sm text-[#dbc7a8]">Browse the live catalog and find your next read</p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-books mt-8 rounded-[30px] p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#7b5a32]">From the shelves</p>
            <h2 className="mt-2 text-4xl font-bold text-[#1f2d2b]">Featured library books</h2>
          </div>
          <Link to="/books" className="font-semibold text-[#1d3b36] hover:text-[#16352f]">View full catalog <span aria-hidden="true">→</span></Link>
        </div>

        {featuredBooks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {featuredBooks.map((book, index) => (
              <article key={book._id} className={`home-book-card home-book-card-${index + 1} flex min-h-56 flex-col justify-between rounded-2xl p-5`}>
                <div>
                  <div className="mb-4 overflow-hidden rounded-2xl border border-[#f2d496]/20 bg-[#241d1e]">
                    <BookCover book={book} className="h-52 w-full object-contain p-3" />
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4d89d]">{book.category || 'General'}</span>
                    <span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">Available</span>
                  </div>
                  <h3 className="mt-6 text-3xl font-semibold leading-none text-[#fff5df]">{book.title}</h3>
                  <p className="mt-3 text-sm text-[#e1cdb0]">by {book.author}</p>
                </div>
                <Link to={`/books/${book._id}`} className="mt-6 inline-flex items-center justify-between border-t border-[#f2d496]/20 pt-3 text-sm font-semibold text-[#f7dfaa] hover:text-white">
                  Read more <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-[#d7c7b4]">Browse the catalog to discover the latest additions.</p>
        )}
      </section>

      <section className="home-pillars mt-8 grid gap-5 md:grid-cols-3">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="home-pillar book-card rounded-[28px] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#d4af75]/35">
            <div className="home-pillar-icon mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#f0d7a3] via-[#d4af75] to-[#9b742f] text-2xl shadow-[0_12px_20px_rgba(212,175,117,0.18)]">
              {pillar.icon}
            </div>
            <h2 className="text-3xl font-bold text-[#f8f1e8]">{pillar.title}</h2>
            <p className="mt-3 text-[#d7c7b4]">{pillar.description}</p>
          </div>
        ))}
      </section>

      <section className="home-cta mt-8 rounded-[30px] border border-[#d4af75]/20 bg-gradient-to-r from-[#211a1d] via-[#171214] to-[#120f12] p-6 shadow-[0_18px_34px_rgba(0,0,0,0.25)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#7b5a32]">Ready to visit</p>
            <h2 className="mt-2 text-4xl font-bold text-[#f8f1e8]">Explore the library today</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/books" className="home-primary-action rounded-full bg-gradient-to-r from-[#d4af75] via-[#c79a52] to-[#f3dfae] px-5 py-3 font-semibold text-[#1a1414] shadow-[0_12px_24px_rgba(212,175,117,0.22)] transition hover:-translate-y-0.5">
              Browse catalog
            </Link>
            <Link to="/contact" className="home-secondary-action rounded-full border border-[#d4af75]/20 bg-[#f5e9d8]/5 px-5 py-3 font-semibold text-[#f6efe6] transition hover:border-[#d4af75]/40 hover:text-[#fff8ee]">
              Contact library
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;
