import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import { ProtectedRoute, PublicOnlyRoute } from '@/components/shared/RouteGuards';

const PublicLayout = lazy(() => import('@/layouts/PublicLayout'));
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

const PortalLayout = lazy(() => import('@/layouts/PortalLayout'));
const DashboardPage = lazy(() => import('@/pages/portal/DashboardPage'));
const AppointmentsPage = lazy(() => import('@/pages/portal/AppointmentsPage'));
const AppointmentsCalendarPage = lazy(() => import('@/pages/portal/AppointmentsCalendarPage'));
const AppointmentRequestsPage = lazy(() => import('@/pages/portal/AppointmentRequestsPage'));
const AppointmentModifyPage = lazy(() => import('@/pages/portal/AppointmentModifyPage'));
const NewAppointmentPage = lazy(() => import('@/pages/portal/NewAppointmentPage'));
const QueuePage = lazy(() => import('@/pages/portal/QueuePage'));
const MedicalFilePage = lazy(() => import('@/pages/portal/MedicalFilePage'));
const MedicalFilePrintPage = lazy(() => import('@/pages/portal/MedicalFilePrintPage'));
const TimelinePage = lazy(() => import('@/pages/portal/TimelinePage'));
const TimelineEventPage = lazy(() => import('@/pages/portal/TimelineEventPage'));
const NotificationsPage = lazy(() => import('@/pages/portal/NotificationsPage'));
const AccountPage = lazy(() => import('@/pages/portal/AccountPage'));

const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminAppointmentsPage = lazy(() => import('@/pages/admin/AdminAppointmentsPage'));
const AdminPatientsPage = lazy(() => import('@/pages/admin/AdminPatientsPage'));
const AdminCalendarPage = lazy(() => import('@/pages/admin/AdminCalendarPage'));


function RouteLoader() {
  return (
    <div className="flex min-h-[45vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-700" />
    </div>
  );
}

const lazyElement = (Component) => (
  <Suspense fallback={<RouteLoader />}>
    <Component />
  </Suspense>
);

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={lazyElement(PublicLayout)}>
        <Route path="/" element={lazyElement(LandingPage)} />
        <Route path="/services" element={lazyElement(ServicesPage)} />
        <Route path="*" element={lazyElement(NotFoundPage)} />
      </Route>

      {/* Auth (hide from authenticated users) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={lazyElement(LoginPage)} />
        <Route path="/register" element={lazyElement(RegisterPage)} />
      </Route>

      {/* Patient portal (protected) */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute roles={['patient']}>
            {lazyElement(PortalLayout)}
          </ProtectedRoute>
        }
      >
        <Route index element={lazyElement(DashboardPage)} />
        <Route path="appointments" element={lazyElement(AppointmentsPage)} />
        <Route path="appointments/calendar" element={lazyElement(AppointmentsCalendarPage)} />
        <Route path="appointments/requests" element={lazyElement(AppointmentRequestsPage)} />
        <Route path="appointments/:appointmentId/modify" element={lazyElement(AppointmentModifyPage)} />
        <Route path="appointments/new" element={lazyElement(NewAppointmentPage)} />
        <Route path="queue" element={lazyElement(QueuePage)} />
        <Route path="medical-file" element={lazyElement(MedicalFilePage)} />
        <Route path="medical-file/print" element={lazyElement(MedicalFilePrintPage)} />
        <Route path="timeline" element={lazyElement(TimelinePage)} />
        <Route path="timeline/:eventId" element={lazyElement(TimelineEventPage)} />
        <Route path="notifications" element={lazyElement(NotificationsPage)} />
        <Route path="account" element={lazyElement(AccountPage)} />
      </Route>

      {/* Admin clinic (Phase 4 iteration 1) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin', 'reception', 'assistant', 'nurse', 'doctor']}>
            {lazyElement(AdminLayout)}
          </ProtectedRoute>
        }
      >
        <Route index element={lazyElement(AdminDashboardPage)} />
        <Route path="appointments" element={lazyElement(AdminAppointmentsPage)} />
        <Route path="patients" element={lazyElement(AdminPatientsPage)} />
        <Route path="calendar" element={lazyElement(AdminCalendarPage)} />
      </Route>

    </Routes>
  );
}
