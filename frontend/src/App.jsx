import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import FleetPage from './pages/FleetPage';
import AvailabilityPage from './pages/AvailabilityPage';
import ReservationsPage from './pages/ReservationsPage';
import ClientsPage from './pages/ClientsPage';
import FacturationPage from './pages/FacturationPage';
import UsersPage from './pages/UsersPage';
import ParcPage from './pages/ParcPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route
        element={(
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/vehicules" element={<FleetPage />} />
        <Route path="/parc" element={<ParcPage />} />
        <Route path="/disponibilite" element={<AvailabilityPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/facturation" element={<FacturationPage />} />
        <Route path="/utilisateurs" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
}
