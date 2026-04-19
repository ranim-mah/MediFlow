import { Outlet } from 'react-router-dom';
import PortalNavbar from '@/components/portal/PortalNavbar';

export default function PortalLayout() {
  return (
    <div className="app-shell">
      <PortalNavbar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
