import { Outlet } from 'react-router-dom';
import DoctorNavbar from '@/components/doctor/DoctorNavbar';

export default function DoctorLayout() {
  return (
    <div className="min-h-screen bg-ink-50">
      <DoctorNavbar />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
