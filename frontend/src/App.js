import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterComplete from './pages/RegisterComplete';
import RegisterAccountType from './pages/RegisterAccountType';
import RegisterBusiness from './pages/RegisterBusiness';
import RegisterJoinBusiness from './pages/RegisterJoinBusiness';
import RegisterCategories from './pages/RegisterCategories';
import RegisterTeamSize from './pages/RegisterTeamSize';
import AdminDashboard from './pages/AdminDashboard';
import AdminBarbershops from './pages/AdminBarbershops';
import AdminPayments from './pages/AdminPayments';
import AdminSettings from './pages/AdminSettings';
import AdminApprovals from './pages/AdminApprovals';
import BarbershopDashboard from './pages/BarbershopDashboard';
import BarbershopAppointments from './pages/BarbershopAppointments';
import BarbershopServices from './pages/BarbershopServices';
import BarbershopRequests from './pages/BarbershopRequests';
import BarbershopProfile from './pages/BarbershopProfile';
import BarbershopSchedule from './pages/BarbershopSchedule';
import BarberProfile from './pages/BarberProfile';
import PublicBooking from './pages/PublicBooking';
import AppointmentConfirmation from './pages/AppointmentConfirmation';
import ClientAppointments from './pages/ClientAppointments';
import BarbershopLanding from './pages/BarbershopLanding';

import Home from './pages/Home';
import LoadingSpinner from './components/LoadingSpinner';

// Componente de rota protegida
const ProtectedRoute = ({ children, requireSuperAdmin = false, requireBarbershop = false }) => {
  const { user, loading, isSuperAdmin, isBarbershopAdmin, isBarber } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (requireBarbershop && !isBarbershopAdmin() && !isBarber()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Componente principal das rotas
const AppRoutes = () => {
  const { user, isSuperAdmin } = useAuth();

  return (
    <Routes>
      {/* Rota raiz - página inicial pública */}
      <Route path="/" element={<Home />} />

      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/complete" element={<RegisterComplete />} />
      <Route path="/register/account-type" element={<RegisterAccountType />} />
      <Route path="/register/business" element={<RegisterBusiness />} />
      <Route path="/register/join-business" element={<RegisterJoinBusiness />} />
      <Route path="/register/categories" element={<RegisterCategories />} />
      <Route path="/register/team-size" element={<RegisterTeamSize />} />
      <Route path="/b/:slug" element={<PublicBooking />} />
      <Route path="/confirmacao/:slug" element={<AppointmentConfirmation />} />
      <Route path="/consulta" element={<ClientAppointments />} />
      <Route path="/consulta/:phone" element={<ClientAppointments />} />
      
      {/* Rota dinâmica para landing pages de barbearias - deve ficar por último */}
      <Route path="/:slug" element={<BarbershopLanding />} />

      {/* Rota para usuários logados */}
      <Route 
        path="/dashboard" 
        element={
          user ? (
            isSuperAdmin() ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/barbershop/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

            {/* Rotas do Admin Master (SUPER_ADMIN) */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute requireSuperAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/barbershops" 
        element={
          <ProtectedRoute requireSuperAdmin>
            <AdminBarbershops />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/admin/payments" 
        element={
          <ProtectedRoute requireSuperAdmin>
            <AdminPayments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute requireSuperAdmin>
            <AdminSettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/approvals" 
        element={
          <ProtectedRoute requireSuperAdmin>
            <AdminApprovals />
          </ProtectedRoute>
        } 
      />

      {/* Rotas da Barbearia (BARBERSHOP_ADMIN e BARBER) */}
      <Route 
        path="/barbershop/dashboard" 
        element={
          <ProtectedRoute requireBarbershop>
            <BarbershopDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barbershop/appointments" 
        element={
          <ProtectedRoute requireBarbershop>
            <BarbershopAppointments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barbershop/services" 
        element={
          <ProtectedRoute requireBarbershop>
            <BarbershopServices />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barbershop/requests" 
        element={
          <ProtectedRoute requireBarbershop>
            <BarbershopRequests />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barbershop/profile" 
        element={
          <ProtectedRoute requireBarbershop>
            <BarbershopProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barbershop/schedule" 
        element={
          <ProtectedRoute requireBarbershop>
            <BarbershopSchedule />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/barbershop/barber-profile" 
        element={
          <ProtectedRoute requireBarbershop>
            <BarberProfile />
          </ProtectedRoute>
        } 
      />


      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Componente principal
const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App; 