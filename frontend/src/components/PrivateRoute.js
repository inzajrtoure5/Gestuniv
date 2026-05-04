import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { utilisateur } = useAuth();
  if (!utilisateur) return <Navigate to="/login" />;
  if (roles && !roles.includes(utilisateur.role)) return <Navigate to="/dashboard" />;
  return children;
};

export default PrivateRoute;