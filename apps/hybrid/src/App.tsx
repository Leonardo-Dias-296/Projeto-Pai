import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/Layout';
import { PistasPage } from './pages/funcionario/PistasPage';
import { DashboardPage } from './pages/financeiro/DashboardPage';

function Home() {
  const { usuario } = useAuth();
  if (usuario?.papel === 'financeiro') return <Navigate to="/financeiro" replace />;
  return <Navigate to="/funcionario/pistas" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Home />} />

        <Route
          path="/funcionario/*"
          element={
            <ProtectedRoute papeis={['chefe', 'mecanico']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="pistas" element={<PistasPage />} />
        </Route>

        <Route
          path="/financeiro/*"
          element={
            <ProtectedRoute papeis={['financeiro']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<DashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
