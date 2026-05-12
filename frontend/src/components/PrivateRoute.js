import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { utilisateur } = useAuth();

  // Pas connecté → login
  if (!utilisateur) return <Navigate to="/login" replace />;

  // Rôle insuffisant → rediriger vers la bonne page selon le rôle
  if (roles && !roles.includes(utilisateur.role)) {
    // Un enseignant va sur son espace, les autres vont sur le dashboard
    const fallback = utilisateur.role === 'enseignant' ? '/mon-espace' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default PrivateRoute;