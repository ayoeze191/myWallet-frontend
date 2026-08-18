import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireAuth({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // Remember where they were headed so logging in doesn't dump them on the
    // dashboard — it matters most for a shared Ajo link.
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}
