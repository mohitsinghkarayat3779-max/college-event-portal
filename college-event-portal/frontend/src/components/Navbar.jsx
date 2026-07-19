import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">🎓 College Event Portal</Link>
      <div className="nav-links">
        {user && user.role === 'admin' && (
          <>
            <Link to="/admin">Admin</Link>
            <Link to="/admin/events">Manage Events</Link>
            <Link to="/admin/announcements">Announcements</Link>
          </>
        )}
        <button className="icon-btn" onClick={toggle} title="Toggle dark mode">
          {dark ? '☀️' : '🌙'}
        </button>
        {user ? (
          <>
            <span className="who">Hi, {user.name}</span>
            <button className="btn-outline" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
