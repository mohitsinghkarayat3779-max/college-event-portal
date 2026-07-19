// Simple loading skeleton used while events/data are being fetched
export default function Skeleton({ count = 6 }) {
  return (
    <div className="event-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="event-card skeleton" key={i}>
          <div className="skeleton-box banner" />
          <div className="event-card-body">
            <div className="skeleton-box" style={{ width: '40%', height: 14 }} />
            <div className="skeleton-box" style={{ width: '80%', height: 20, marginTop: 8 }} />
            <div className="skeleton-box" style={{ width: '60%', height: 14, marginTop: 8 }} />
            <div className="skeleton-box" style={{ width: '50%', height: 14, marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
