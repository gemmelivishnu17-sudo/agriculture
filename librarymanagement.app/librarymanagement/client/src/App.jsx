import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import AdminBooks from './pages/AdminBooks';
import MyBorrows from './pages/MyBorrows';
import AdminBorrows from './pages/AdminBorrows';
import Dashboard from './pages/Dashboard';
import AdminStats from './pages/AdminStats';
import Home from './pages/Home';
import Contact from './pages/Contact';
import ReadingList from './pages/ReadingList';
import AdminMessages from './pages/AdminMessages';
import Navbar from './components/Navbar';

const Application = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isHomePage = location.pathname === '/';

  return (
    <div className={`luxury-theme min-h-screen bg-transparent text-slate-100 antialiased selection:bg-amber-200 selection:text-stone-950 ${isHomePage ? 'home-route' : ''}`}>
      {!isAuthPage && !isHomePage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/my-borrows" element={<ProtectedRoute><MyBorrows /></ProtectedRoute>} />
        <Route path="/reading-list" element={<ProtectedRoute><ReadingList /></ProtectedRoute>} />
        <Route path="/admin/books" element={<ProtectedRoute><AdminBooks /></ProtectedRoute>} />
        <Route path="/admin/borrows" element={<ProtectedRoute><AdminBorrows /></ProtectedRoute>} />
        <Route path="/admin/stats" element={<ProtectedRoute><AdminStats /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Application />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
