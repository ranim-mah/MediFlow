import { Outlet } from 'react-router-dom';
import PortalNavbar from '@/components/portal/PortalNavbar';

export default function PortalLayout() {
  return (
    <div className="min-h-screen bg-ink-50">
      <PortalNavbar />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
