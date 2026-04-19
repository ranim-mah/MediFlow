import { Outlet } from 'react-router-dom';
import DoctorNavbar from '@/components/doctor/DoctorNavbar';

export default function DoctorLayout() {
  return (
    <div className="app-shell">
      <DoctorNavbar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
