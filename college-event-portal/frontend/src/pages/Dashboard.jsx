import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios.js';
import EventCard from '../components/EventCard.jsx';
import Skeleton from '../components/Skeleton.jsx';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [myRegs, setMyRegs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('upcoming'); // upcoming | past | all
  const [view, setView] = useState('all'); // all | mine

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      if (status !== 'all') params.status = status;

      const [eventsRes, regsRes, annRes] = await Promise.all([
        api.get('/events', { params }),
        api.get('/registrations/my'),
        api.get('/announcements'),
      ]);
      setEvents(eventsRes.data);
      setMyRegs(regsRes.data);
      setAnnouncements(annRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status]);

  const registeredEventIds = useMemo(
    () => new Set(myRegs.map((r) => r.event?._id)),
    [myRegs]
  );

  const visibleEvents = useMemo(() => {
    if (view === 'mine') {
      return myRegs.map((r) => r.event).filter(Boolean);
    }
    return events;
  }, [view, events, myRegs]);

  return (
    <div>
      {announcements.length > 0 && (
        <div className="announcements-strip">
          <strong>📢 Announcements</strong>
          <div className="announcements-list">
            {announcements.slice(0, 5).map((a) => (
              <div key={a._id} className="announcement-item">
                <span className="ann-title">{a.title}</span>
                <span className="muted"> — {a.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search events by title, description, or venue..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="all">All dates</option>
        </select>
        <div className="tab-toggle">
          <button className={view === 'all' ? 'active' : ''} onClick={() => setView('all')}>
            All Events
          </button>
          <button className={view === 'mine' ? 'active' : ''} onClick={() => setView('mine')}>
            My Registrations ({myRegs.length})
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton />
      ) : visibleEvents.length === 0 ? (
        <p className="muted empty-state">No events found.</p>
      ) : (
        <div className="event-grid">
          {visibleEvents.map((event) => (
            <EventCard key={event._id} event={event} registered={registeredEventIds.has(event._id)} />
          ))}
        </div>
      )}
    </div>
  );
}
