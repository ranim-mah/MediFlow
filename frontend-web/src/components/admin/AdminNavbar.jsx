import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, ClipboardList, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/authApi';
import { cn } from '@/lib/cn';

export default function AdminNavbar() {
  const { user, refreshToken, logout } = useAuthStore();

  const links = [
    { to: '/admin', end: true, label: 'لوحة التحكم', icon: LayoutDashboard },
    { to: '/admin/appointments', label: 'المواعيد', icon: ClipboardList },
    { to: '/admin/patients', label: 'المرضى', icon: Users },
    { to: '/admin/calendar', label: 'الروزنامة', icon: CalendarDays },
  ];

  const onLogout = async () => {
    try {
      await authApi.logout(refreshToken);
    } catch {}
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 bg-ink-950 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md">
            <svg viewBox="0 0 32 32" className="h-5 w-5">
              <path d="M6 24V8l10 14L26 8v16" stroke="#1e4eaf" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="font-black text-sm">عيادة ميدي فلو</span>
            <span className="text-[11px] text-white/60">بوابة الإدارة</span>
          </div>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
                  isActive ? 'bg-white text-ink-950 shadow-md' : 'text-white/80 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <div className="hidden rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs md:block">
            {user?.fullName}
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </button>
        </div>
      </div>
    </header>
  );
}