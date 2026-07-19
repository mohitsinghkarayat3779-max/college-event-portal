import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [myRegs, setMyRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [eventRes, regsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get('/registrations/my'),
      ]);
      setEvent(eventRes.data);
      setMyRegs(regsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <p className="muted">Loading event...</p>;
  if (!event) return <p className="error">Event not found.</p>;

  const myRegistration = myRegs.find((r) => r.event?._id === id);
  const deadlinePassed = new Date() > new Date(event.registrationDeadline);
  const full = event.availableSeats <= 0;

  const handleRegister = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      await api.post(`/registrations/${id}`);
      setMessage('You are registered! 🎉');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Registration failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      await api.delete(`/registrations/${id}`);
      setMessage('Registration cancelled.');
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="event-details">
      <button className="btn-outline" onClick={() => navigate(-1)}>&larr; Back</button>

      <img
        src={event.bannerImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200'}
        alt={event.title}
        className="event-details-banner"
      />

      <div className="event-details-body">
        <span className="badge">{event.category}</span>
        <h1>{event.title}</h1>
        <p>{event.description}</p>

        <div className="details-grid">
          <div><strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString()}</div>
          <div><strong>🕒 Time:</strong> {event.time}</div>
          <div><strong>📍 Venue:</strong> {event.venue}</div>
          <div><strong>⏳ Registration deadline:</strong> {new Date(event.registrationDeadline).toLocaleString()}</div>
          <div><strong>💺 Seats:</strong> {event.availableSeats}/{event.totalSeats} available</div>
        </div>

        {message && <p className="info">{message}</p>}

        {myRegistration ? (
          <div className="registered-panel">
            <p className="success-text">✅ You're registered for this event.</p>
            <div className="qr-wrap">
              <QRCodeSVG value={`registration:${myRegistration._id}`} size={140} />
              <p className="muted">Show this QR code at check-in</p>
            </div>
            <button className="btn-outline" onClick={handleCancel} disabled={actionLoading}>
              Cancel registration
            </button>
          </div>
        ) : (
          <button
            onClick={handleRegister}
            disabled={actionLoading || deadlinePassed || full}
          >
            {deadlinePassed ? 'Registration closed' : full ? 'Event full' : actionLoading ? 'Registering...' : 'Register for this event'}
          </button>
        )}
      </div>
    </div>
  );
}
