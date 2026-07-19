import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios.js';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const toDateTimeInput = (d) => (d ? new Date(d).toISOString().slice(0, 16) : '');

const emptyForm = {
  title: '', description: '', bannerImage: '', date: '', time: '',
  venue: '', category: 'Technical', registrationDeadline: '', totalSeats: 50,
};

export default function EventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      const { data } = await api.get(`/events/${id}`);
      setForm({
        title: data.title,
        description: data.description,
        bannerImage: data.bannerImage || '',
        date: toDateInput(data.date),
        time: data.time,
        venue: data.venue,
        category: data.category,
        registrationDeadline: toDateTimeInput(data.registrationDeadline),
        totalSeats: data.totalSeats,
      });
      setLoading(false);
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === 'totalSeats' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/events/${id}`, form);
      } else {
        await api.post('/events', form);
      }
      navigate('/admin/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="muted">Loading...</p>;

  return (
    <div className="form-page">
      <h1>{isEdit ? 'Edit Event' : 'Create Event'}</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="event-form">
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" rows={4} value={form.description} onChange={handleChange} required />

        <label>Banner image URL</label>
        <input name="bannerImage" value={form.bannerImage} onChange={handleChange} placeholder="https://..." />

        <div className="form-row">
          <div>
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>
          <div>
            <label>Time</label>
            <input name="time" placeholder="e.g. 5:00 PM" value={form.time} onChange={handleChange} required />
          </div>
        </div>

        <label>Venue</label>
        <input name="venue" value={form.venue} onChange={handleChange} required />

        <div className="form-row">
          <div>
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label>Total seats</label>
            <input type="number" name="totalSeats" min={1} value={form.totalSeats} onChange={handleChange} required />
          </div>
        </div>

        <label>Registration deadline</label>
        <input type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} required />

        <button type="submit" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create event'}</button>
      </form>
    </div>
  );
}
