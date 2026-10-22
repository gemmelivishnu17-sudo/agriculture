import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="luxury-nav sticky top-0 z-50 border-b border-[#d1ad6b]/20 bg-[#111512]/90 shadow-[0_12px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link to="/" className="flex items-center gap-2 rounded-full border border-[#d1ad6b]/25 bg-[#191f1b] px-3 py-2 text-sm font-black tracking-tight text-[#f4eee3] shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#e8c985] via-[#82927a] to-[#d8bd81] text-base text-[#171713]">📚</span>
            <span className="text-gradient">LibraryApp</span>
          </Link>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                Dashboard
              </NavLink>
              <NavLink to="/books" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                Books
              </NavLink>
              <NavLink to="/contact" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                Contact
              </NavLink>
              <NavLink to="/my-borrows" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                My Borrows
              </NavLink>
              <NavLink to="/reading-list" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                Reading List
              </NavLink>

              {user?.role === 'admin' && (
                <>
                  <NavLink to="/admin/books" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                    Manage Books
                  </NavLink>
                  <NavLink to="/admin/borrows" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                    Borrow Records
                  </NavLink>
                  <NavLink to="/admin/messages" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                    Messages
                  </NavLink>
                  <NavLink to="/admin/stats" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                    Stats
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <NavLink to="/books" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                Books
              </NavLink>
              <NavLink to="/contact" className={({ isActive }) => `rounded-full px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-[#d2ad6c] text-[#161915] shadow-md shadow-black/20' : 'text-[#c8c7bd] hover:text-[#f4d99b]'}`}>
                Contact
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="rounded-full border border-[#d1ad6b]/35 bg-[#1a201c] px-4 py-2 text-sm font-semibold text-[#e9e3d8] shadow-sm transition hover:border-[#d1ad6b]/60">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-gradient-to-r from-[#b99150] via-[#d1ad6b] to-[#ead49b] px-4 py-2 text-sm font-semibold text-[#1a1914] shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition hover:scale-[1.02]">
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#d1ad6b] px-4 py-2 text-sm font-semibold text-[#1a1914] shadow-md shadow-black/20 transition hover:bg-[#e2c17f]"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
