import { useEffect, useState } from 'react';
import api from '../../api/axios.js';

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', event: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const [annRes, eventsRes] = await Promise.all([
      api.get('/announcements'),
      api.get('/events', { params: { status: 'all' } }),
    ]);
    setAnnouncements(annRes.data);
    setEvents(eventsRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/announcements', { ...form, event: form.event || null });
      setForm({ title: '', message: '', event: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <div>
      <h1>Announcements</h1>

      <form onSubmit={handleSubmit} className="event-form" style={{ maxWidth: 500 }}>
        {error && <p className="error">{error}</p>}
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />
        <label>Message</label>
        <textarea name="message" rows={3} value={form.message} onChange={handleChange} required />
        <label>Related event (optional)</label>
        <select name="event" value={form.event} onChange={handleChange}>
          <option value="">None</option>
          {events.map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>
        <button type="submit">Publish announcement</button>
      </form>

      <h2 style={{ marginTop: '2rem' }}>Published</h2>
      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <div className="announcements-admin-list">
          {announcements.map((a) => (
            <div key={a._id} className="announcement-card">
              <div>
                <strong>{a.title}</strong>
                {a.event && <span className="badge">{a.event.title}</span>}
                <p className="muted">{a.message}</p>
                <span className="muted small">{new Date(a.createdAt).toLocaleString()}</span>
              </div>
              <button className="link-danger" onClick={() => handleDelete(a._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
