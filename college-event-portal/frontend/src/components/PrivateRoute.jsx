import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Any logged-in user (student or admin) can access
export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
