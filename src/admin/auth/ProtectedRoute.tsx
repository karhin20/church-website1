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
  const { user, userRole } = useAuth();

  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}; 