import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ events: 0, upcoming: 0, seatsFilled: 0, totalSeats: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: events } = await api.get('/events', { params: { status: 'all' } });
      const upcoming = events.filter((e) => new Date(e.date) >= new Date()).length;
      const totalSeats = events.reduce((sum, e) => sum + e.totalSeats, 0);
      const seatsFilled = events.reduce((sum, e) => sum + (e.totalSeats - e.availableSeats), 0);
      setStats({ events: events.length, upcoming, seatsFilled, totalSeats });
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p className="muted">Quick overview and shortcuts to manage the portal.</p>

      {!loading && (
        <div className="stats-grid">
          <div className="stat-card"><span className="stat-num">{stats.events}</span><span>Total events</span></div>
          <div className="stat-card"><span className="stat-num">{stats.upcoming}</span><span>Upcoming events</span></div>
          <div className="stat-card"><span className="stat-num">{stats.seatsFilled}</span><span>Seats filled</span></div>
          <div className="stat-card"><span className="stat-num">{stats.totalSeats}</span><span>Total seat capacity</span></div>
        </div>
      )}

      <div className="admin-links">
        <Link to="/admin/events" className="admin-link-card">
          <h3>📅 Manage Events</h3>
          <p className="muted">Create, edit, or delete events.</p>
        </Link>
        <Link to="/admin/announcements" className="admin-link-card">
          <h3>📢 Announcements</h3>
          <p className="muted">Publish updates visible to all students.</p>
        </Link>
      </div>
    </div>
  );
}
