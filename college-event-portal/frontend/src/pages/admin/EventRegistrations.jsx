import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios.js';

export default function EventRegistrations() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [eventRes, regsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/registrations/event/${id}`),
      ]);
      setEvent(eventRes.data);
      setRegistrations(regsRes.data);
      setLoading(false);
    };
    load();
  }, [id]);

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Registered At']];
    registrations.forEach((r) => rows.push([r.user.name, r.user.email, new Date(r.createdAt).toLocaleString()]));
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title || 'event'}-registrations.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="muted">Loading...</p>;

  return (
    <div>
      <Link to="/admin/events">&larr; Back to events</Link>
      <div className="page-header">
        <h1>Registrants: {event?.title}</h1>
        <button onClick={exportCSV} disabled={registrations.length === 0}>Export CSV</button>
      </div>
      <p className="muted">{registrations.length} student(s) registered.</p>

      <table className="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Registered At</th></tr></thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r._id}>
              <td>{r.user.name}</td>
              <td>{r.user.email}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
