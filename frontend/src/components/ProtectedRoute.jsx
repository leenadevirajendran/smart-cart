import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    if (allowedRole && decoded.role !== allowedRole) {
      return <Navigate to="/products" />;
    }
  } catch {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;