import { Routes, Route } from 'react-router-dom';

// Public
import PublicLayout from '@/layouts/PublicLayout';
import LandingPage from '@/pages/LandingPage';
import ServicesPage from '@/pages/ServicesPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Auth
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Portal
import PortalLayout from '@/layouts/PortalLayout';
import DashboardPage from '@/pages/portal/DashboardPage';
import AppointmentsPage from '@/pages/portal/AppointmentsPage';
import NewAppointmentPage from '@/pages/portal/NewAppointmentPage';
import QueuePage from '@/pages/portal/QueuePage';
import MedicalFilePage from '@/pages/portal/MedicalFilePage';
import TimelinePage from '@/pages/portal/TimelinePage';
import NotificationsPage from '@/pages/portal/NotificationsPage';

import { ProtectedRoute, PublicOnlyRoute } from '@/components/shared/RouteGuards';

// Admin
import AdminLayout from '@/layouts/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminPatientsPage from '@/pages/admin/AdminPatientsPage';
import AdminCalendarPage from '@/pages/admin/AdminCalendarPage';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth (hide from authenticated users) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Patient portal (protected) */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute roles={['patient']}>
            <PortalLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="appointments/new" element={<NewAppointmentPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="medical-file" element={<MedicalFilePage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Admin clinic (Phase 4 iteration 1) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin', 'reception', 'assistant', 'nurse', 'doctor']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="patients" element={<AdminPatientsPage />} />
        <Route path="calendar" element={<AdminCalendarPage />} />
      </Route>
    </Routes>
  );
}
