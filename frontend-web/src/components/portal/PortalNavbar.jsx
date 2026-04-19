import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home, Calendar, Hash, FolderOpen, ListOrdered, Bell, MoreHorizontal,
  Search, Settings, LogOut, FileText, CalendarPlus,
} from 'lucide-react';
import { authApi } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { cn } from '@/lib/cn';

export default function PortalNavbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, refreshToken, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(refreshToken); } catch {}
    logout();
    navigate('/login', { replace: true });
  };

  const links = [
    { to: '/portal', label: t('portal.nav.home'), icon: Home, end: true },
    { to: '/portal/appointments', label: t('portal.nav.appointments'), icon: Calendar },
    { to: '/portal/queue', label: t('portal.nav.queue'), icon: Hash },
    { to: '/portal/medical-file', label: t('portal.nav.medicalFile'), icon: FolderOpen },
    { to: '/portal/timeline', label: t('portal.nav.timeline'), icon: ListOrdered },
    { to: '/portal/notifications', label: t('portal.nav.notifications'), icon: Bell },
  ];

  return (
    <header className="sticky top-0 z-40 bg-ink-950 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
        {/* Brand */}
        <Link to="/portal" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md">
            <svg viewBox="0 0 32 32" className="h-5 w-5">
              <path d="M6 24V8l10 14L26 8v16" stroke="#1e4eaf" strokeWidth="3" fill="none"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="font-black text-sm">{t('common.appName')}</span>
            <span className="text-[11px] text-white/60">{t('nav.patientPortal')}</span>
          </div>
        </Link>

        {/* Desktop nav links (reverse order for RTL feel matching image 3) */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-white text-ink-950 shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher variant="light" />

          <Link
            to="/portal/appointments/new"
            className="hidden items-center gap-1 rounded-xl bg-amber-400 px-3 py-2 text-sm font-bold text-amber-950 hover:bg-amber-300 md:flex"
          >
            <CalendarPlus className="h-4 w-4" />
            {t('portal.nav.bookAppointment')}
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('common.logout')}</span>
          </button>
        </div>
      </div>

      {/* Mobile horizontal scroll nav */}
      <nav className="flex gap-1 overflow-x-auto bg-ink-900 px-4 py-2 md:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
                isActive ? 'bg-white text-ink-950' : 'text-white/80'
              )
            }
          >
            <l.icon className="h-3.5 w-3.5" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* User strip (matches image 3's top bar) */}
      {user && (
        <div className="bg-ink-900/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs md:px-6">
            <span className="text-white/70 truncate">{user.fullName}</span>
            <span className="text-white/50">{user.email || user.phone}</span>
          </div>
        </div>
      )}
    </header>
  );
}
