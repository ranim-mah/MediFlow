import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, Calendar, UserPlus2, Loader2, KeyRound, IdCard, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import Logo from '@/components/ui/Logo';

const roleHome = (role) => {
  if (role === 'patient') return '/portal';
  if (role === 'doctor') return '/doctor';
  if (role === 'admin' || role === 'reception' || role === 'assistant' || role === 'nurse') return '/admin';
  return '/';
};

const canAccessPath = (role, path = '') => {
  if (!path) return false;
  if (role === 'patient') return path.startsWith('/portal');
  if (role === 'doctor') return path.startsWith('/doctor') || path.startsWith('/admin');
  return path.startsWith('/admin');
};

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const fromPath = location.state?.from?.pathname || '';
  const roleHint = new URLSearchParams(location.search).get('role') || '';

  const loginTitle =
    roleHint === 'admin' || fromPath.startsWith('/admin')
      ? 'Portail admin'
      : roleHint === 'doctor' || fromPath.startsWith('/doctor')
        ? 'Portail médecin'
        : t('auth.loginTitle');

  const [form, setForm] = useState({ identifier: '', password: '' });

  const loginMut = useMutation({
    mutationFn: (payload) => authApi.login(payload),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data;
      setAuth({ user, accessToken, refreshToken });
      toast.success(t('auth.loginSuccess'));
      const from = location.state?.from?.pathname || '';
      // Si on vient du bouton admin, forcer /admin
      if (user.role === 'admin' || user.role === 'reception' || user.role === 'assistant' || user.role === 'nurse') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'doctor') {
        navigate('/doctor', { replace: true });
      } else {
        const dest = canAccessPath(user.role, from) ? from : roleHome(user.role);
        navigate(dest, { replace: true });
      }
    },
    onError: (err) => toast.error(err.message || t('common.error')),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    loginMut.mutate(form);
  };

  return (
    <div className="app-shell">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-6">
        <Link to="/"><Logo variant="dark" /></Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="dark" />
          <Link to="/" className="text-sm font-semibold text-ink-700 hover:text-brand-700">
            {t('nav.home')}
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 pt-6 pb-16 md:grid-cols-2 md:px-6">
        {/* Info card */}
        <div className="card order-2 md:order-1">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
            <BookOpen className="h-3.5 w-3.5" /> {t('auth.infoTitle').split(' ')[0]}
          </div>
          <h2 className="mb-1 text-2xl font-black">{t('auth.infoTitle')}</h2>
          <p className="mb-5 text-sm text-ink-500">{t('auth.infoSubtitle')}</p>

          <div className="space-y-3">
            <div className="rounded-2xl border border-ink-200 bg-white p-4">
              <h3 className="font-bold text-ink-900">{t('auth.info1Title')}</h3>
              <p className="mt-1 text-sm text-ink-500">{t('auth.info1Desc')}</p>
            </div>
            <div className="rounded-2xl border border-ink-200 bg-white p-4">
              <h3 className="font-bold text-ink-900">{t('auth.info2Title')}</h3>
              <p className="mt-1 text-sm text-ink-500">{t('auth.info2Desc')}</p>
            </div>
          </div>
        </div>

        {/* Login card */}
        <div className="card order-1 md:order-2">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
            <LogIn className="h-3.5 w-3.5" /> {t('common.login')}
          </div>

          <h1 className="text-3xl font-black">{loginTitle}</h1>
          <p className="mt-1 text-sm text-ink-500">{t('auth.loginSubtitle')}</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink-800">
                {t('auth.identifier')}
              </label>
              <div className="relative">
                <IdCard className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 start-3" />
                <input
                  name="identifier"
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                  placeholder={t('auth.identifierPlaceholder')}
                  className="input ps-10"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-ink-800">
                {t('auth.password')}
              </label>
              <div className="relative">
                <KeyRound className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 start-3" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input ps-10"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-500">{t('auth.forgotHint')}</span>
              <a href="#" className="font-bold text-brand-700 hover:underline">
                {t('auth.forgotPassword')}
              </a>
            </div>

            <button type="submit" disabled={loginMut.isPending} className="btn-primary w-full">
              {loginMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {t('auth.loginBtn')}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm text-ink-500">{t('auth.noAccount')}</span>
            <Link to="/register" className="text-sm font-bold text-brand-700 hover:underline">
              {t('auth.createAccount')}
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <a href="#" className="rounded-xl border border-ink-200 p-3 text-center transition-colors hover:bg-ink-50">
              <UserPlus2 className="mx-auto mb-1 h-4 w-4 text-brand-700" />
              <span className="block text-xs font-bold text-ink-800">{t('auth.createAccount')}</span>
            </a>
            <a href="#" className="rounded-xl border border-ink-200 p-3 text-center transition-colors hover:bg-ink-50">
              <Calendar className="mx-auto mb-1 h-4 w-4 text-brand-700" />
              <span className="block text-xs font-bold text-ink-800">{t('auth.myAppointments')}</span>
            </a>
            <a href="#" className="rounded-xl border border-ink-200 p-3 text-center transition-colors hover:bg-ink-50">
              <BookOpen className="mx-auto mb-1 h-4 w-4 text-brand-700" />
              <span className="block text-xs font-bold text-ink-800">{t('auth.followDashboard')}</span>
            </a>
          </div>
        </div>
      </div>

      <footer className="pb-8 text-center text-xs text-ink-400">
        <span>Mediflow_v5.4</span>
        <span className="mx-3">•</span>
        <span>{t('footer.rights')}</span>
      </footer>
    </div>
  );
}
