import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const roleHome = (role) => {
  if (role === 'patient') return '/portal';
  if (role === 'doctor') return '/doctor';
  return '/admin';
};

export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  const role = user?.role;

  // Treat partial/corrupted auth state as logged-out.
  if (!isAuthenticated || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  // If auth is inconsistent (no role), allow login/register to render.
  if (isAuthenticated && user?.role) {
    const dest = roleHome(user.role);
    return <Navigate to={dest} replace />;
  }
  return children || <Outlet />;
}
