import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create your student account</h2>
        {error && <p className="error">{error}</p>}
        <label>Full name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" minLength={6} value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
