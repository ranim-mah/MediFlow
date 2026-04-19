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

      {/* Admin placeholder (Phase 4) */}
      <Route
        path="/admin/*"
        element={
          <div className="min-h-screen flex items-center justify-center p-6 text-center">
            <div>
              <h1 className="text-2xl font-black">🚧 Admin portal — Phase 4</h1>
              <p className="mt-2 text-ink-500">Coming next.</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
