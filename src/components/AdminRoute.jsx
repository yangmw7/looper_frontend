import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');
  return roles.includes('ADMIN')
    ? <Outlet />
    : <Navigate to="/" replace />;
}
