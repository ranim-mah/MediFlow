import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Search, Bell, Moon, Sun, Building2 } from 'lucide-react';
import { authApi } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function AdminTopbar({ onMenuClick, dark, setDark }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshToken, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(refreshToken); } catch {}
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 bg-ink-950 text-white shadow-lg">
      <div className="flex items-center gap-2 px-3 py-3 md:px-5">
        {/* Menu toggle (mobile) */}
        <button onClick={onMenuClick} className="rounded-lg p-2 hover:bg-white/10 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{t('common.logout')}</span>
        </button>

        {/* Notifications bell */}
        <button className="relative rounded-xl p-2 hover:bg-white/10">
          <Bell className="h-5 w-5" />
        </button>

        {/* Central search + branch selector */}
        <div className="flex flex-1 items-center gap-2 justify-center max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 start-3" />
            <input
              placeholder={t('admin.quickSearch') + ' (Ctrl+K)'}
              className="w-full rounded-xl border border-brand-500/40 bg-white/5 px-4 py-2 ps-10 text-sm placeholder:text-brand-300 focus:outline-none focus:border-brand-400"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm">
            <Building2 className="h-4 w-4 text-white/60" />
            <span>{t('admin.mainBranch')}</span>
          </div>
        </div>

        {/* Dark mode */}
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
        >
          {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{dark ? t('admin.lightMode') : t('admin.darkMode')}</span>
        </button>

        <LanguageSwitcher variant="light" />

        {/* Brand */}
        <div className="hidden md:flex items-center gap-3 border-s border-white/10 ps-4">
          <div>
            <p className="text-sm font-black leading-tight">{t('admin.systemName')}</p>
            <p className="text-xs text-white/60">عيادة ميدي فلو</p>
          </div>
        </div>
      </div>
    </header>
  );
}
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Search, Bell, Moon, Sun, Building2 } from 'lucide-react';
import { authApi } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function AdminTopbar({ onMenuClick, dark, setDark }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshToken, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await authApi.logout(refreshToken); } catch {}
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 bg-ink-950 text-white shadow-lg">
      <div className="flex items-center gap-2 px-3 py-3 md:px-5">
        {/* Menu toggle (mobile) */}
        <button onClick={onMenuClick} className="rounded-lg p-2 hover:bg-white/10 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{t('common.logout')}</span>
        </button>

        {/* Notifications bell */}
        <button className="relative rounded-xl p-2 hover:bg-white/10">
          <Bell className="h-5 w-5" />
        </button>

        {/* Central search + branch selector */}
        <div className="flex flex-1 items-center gap-2 justify-center max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 start-3" />
            <input
              placeholder={t('admin.quickSearch') + ' (Ctrl+K)'}
              className="w-full rounded-xl border border-brand-500/40 bg-white/5 px-4 py-2 ps-10 text-sm placeholder:text-brand-300 focus:outline-none focus:border-brand-400"
            />
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm">
            <Building2 className="h-4 w-4 text-white/60" />
            <span>{t('admin.mainBranch')}</span>
          </div>
        </div>

        {/* Dark mode */}
        <button
          onClick={() => setDark(!dark)}
          className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
        >
          {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{dark ? t('admin.lightMode') : t('admin.darkMode')}</span>
        </button>

        <LanguageSwitcher variant="light" />

        {/* Brand */}
        <div className="hidden md:flex items-center gap-3 border-s border-white/10 ps-4">
          <div>
            <p className="text-sm font-black leading-tight">{t('admin.systemName')}</p>
            <p className="text-xs text-white/60">عيادة ميدي فلو</p>
          </div>
        </div>
      </div>
    </header>
  );
}
