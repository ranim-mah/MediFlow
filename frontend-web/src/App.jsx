import { Routes, Route } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import LandingPage from '@/pages/LandingPage';
import ServicesPage from '@/pages/ServicesPage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      {/* Future routes: /portal/*, /admin/*, /login, /register */}
    </Routes>
  );
}
