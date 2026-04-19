import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2, UserPlus2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import Logo from '@/components/ui/Logo';

export default function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    preferredLanguage: i18n.language,
  });

  const registerMut = useMutation({
    mutationFn: (payload) => authApi.register(payload),
    onSuccess: (res) => {
      const { user, accessToken, refreshToken } = res.data;
      setAuth({ user, accessToken, refreshToken });
      toast.success(t('auth.registerSuccess'));
      navigate('/portal', { replace: true });
    },
    onError: (err) => toast.error(err.message || t('common.error')),
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.email && !form.phone) {
      toast.error(t('common.error'));
      return;
    }
    registerMut.mutate(form);
  };

  return (
    <div className="app-shell">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-6">
        <Link to="/"><Logo variant="dark" /></Link>
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="mx-auto max-w-md px-4 pt-6 pb-16">
        <div className="card">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
            <UserPlus2 className="h-3.5 w-3.5" /> {t('common.register')}
          </div>

          <h1 className="text-3xl font-black">{t('auth.registerTitle')}</h1>
          <p className="mt-1 text-sm text-ink-500">{t('auth.registerSubtitle')}</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink-800">
                {t('booking.fullName')} <span className="text-rose-500">*</span>
              </label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={onChange}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-semibold text-ink-800">
                  {t('booking.phone')}
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  className="input"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-ink-800">
                  {t('booking.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  className="input"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-ink-800">
                {t('auth.password')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="min. 6 characters"
                className="input"
                dir="ltr"
                minLength={6}
                required
              />
            </div>

            <button type="submit" disabled={registerMut.isPending} className="btn-primary mt-2 w-full">
              {registerMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {t('auth.registerBtn')}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm text-ink-500">{t('auth.alreadyAccount')}</span>
            <Link to="/login" className="text-sm font-bold text-brand-700 hover:underline">
              {t('common.login')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
