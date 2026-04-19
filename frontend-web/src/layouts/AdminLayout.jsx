import { Outlet } from 'react-router-dom';
import AdminNavbar from '@/components/admin/AdminNavbar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-ink-50">
      <AdminNavbar />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}