import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { ROLES } from './auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [ROLES.ADMIN] 
}: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}; 