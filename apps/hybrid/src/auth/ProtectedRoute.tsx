import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { PapelUsuario } from '@autocontrol/shared';

interface Props {
  children: JSX.Element;
  papeis?: PapelUsuario[];
}

export function ProtectedRoute({ children, papeis }: Props) {
  const { isAuthenticated, usuario } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (papeis && usuario && !papeis.includes(usuario.papel)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
