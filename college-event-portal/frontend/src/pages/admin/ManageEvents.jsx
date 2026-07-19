import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get('/events', { params: { status: 'all' } });
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This also removes all its registrations.')) return;
    await api.delete(`/events/${id}`);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Manage Events</h1>
        <Link to="/admin/events/new"><button>+ New Event</button></Link>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th><th>Date</th><th>Category</th><th>Seats</th><th>Deadline</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e._id}>
                <td>{e.title}</td>
                <td>{new Date(e.date).toLocaleDateString()}</td>
                <td>{e.category}</td>
                <td>{e.availableSeats}/{e.totalSeats}</td>
                <td>{new Date(e.registrationDeadline).toLocaleDateString()}</td>
                <td className="actions">
                  <Link to={`/admin/events/${e._id}/registrations`}>Registrants</Link>
                  <Link to={`/admin/events/${e._id}/edit`}>Edit</Link>
                  <button className="link-danger" onClick={() => handleDelete(e._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
