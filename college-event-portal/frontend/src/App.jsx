import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EventDetails from './pages/EventDetails.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageEvents from './pages/admin/ManageEvents.jsx';
import EventForm from './pages/admin/EventForm.jsx';
import EventRegistrations from './pages/admin/EventRegistrations.jsx';
import ManageAnnouncements from './pages/admin/ManageAnnouncements.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <PrivateRoute>
                <EventDetails />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <AdminRoute>
                <ManageEvents />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <AdminRoute>
                <EventForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <AdminRoute>
                <EventForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events/:id/registrations"
            element={
              <AdminRoute>
                <EventRegistrations />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/announcements"
            element={
              <AdminRoute>
                <ManageAnnouncements />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
