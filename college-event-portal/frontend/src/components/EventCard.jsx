import { Link } from 'react-router-dom';

const fallbackImg =
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800';

export default function EventCard({ event, registered }) {
  const deadlinePassed = new Date() > new Date(event.registrationDeadline);
  const full = event.availableSeats <= 0;

  return (
    <Link to={`/events/${event._id}`} className="event-card">
      <img src={event.bannerImage || fallbackImg} alt={event.title} className="event-banner" />
      <div className="event-card-body">
        <span className="badge">{event.category}</span>
        <h3>{event.title}</h3>
        <p className="muted">
          📅 {new Date(event.date).toLocaleDateString()} · 🕒 {event.time}
        </p>
        <p className="muted">📍 {event.venue}</p>
        <div className="event-card-footer">
          <span className={`seats ${full ? 'danger' : ''}`}>
            {event.availableSeats}/{event.totalSeats} seats left
          </span>
          {registered && <span className="badge success">Registered</span>}
          {!registered && (deadlinePassed || full) && (
            <span className="badge muted-badge">
              {deadlinePassed ? 'Closed' : 'Full'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
