import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { User, Mail, Phone, Globe, ShieldCheck, Bell, FolderOpen, ArrowRight } from 'lucide-react';

function Row({ icon: Icon, label, value, dir }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[#e7eef8] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf4ff] text-brand-700">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-[#6d7ea6]">{label}</span>
      </div>
      <span className="font-bold text-[#19233f]" dir={dir}>{value || '—'}</span>
    </div>
  );
}

export default function AccountPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
        <h1 className="text-2xl font-black tracking-tight text-[#19233f] md:text-3xl">
          <User className="me-2 inline h-7 w-7 text-brand-700" />
          {t('portal.account.title')}
        </h1>
        <p className="mt-1 text-[#6d7ea6]">{t('portal.account.subtitle')}</p>
      </section>

      <section className="space-y-3">
        <Row icon={User} label={t('portal.account.fullName')} value={user?.fullName} />
        <Row icon={Mail} label={t('portal.account.email')} value={user?.email} dir="ltr" />
        <Row icon={Phone} label={t('portal.account.phone')} value={user?.phone} dir="ltr" />
        <Row icon={Globe} label={t('portal.account.language')} value={i18n.language.toUpperCase()} dir="ltr" />
        <Row icon={ShieldCheck} label={t('portal.account.role')} value={user?.role} dir="ltr" />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/portal/notifications" className="rounded-[24px] border border-[#e7eef8] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-colors hover:border-brand-300 hover:bg-brand-50">
          <Bell className="mb-2 h-5 w-5 text-brand-700" />
          <h2 className="font-black tracking-tight text-[#19233f]">{t('portal.account.notifications')}</h2>
          <p className="mt-1 text-sm text-[#6d7ea6]">{t('portal.account.notificationsDesc')}</p>
        </Link>

        <Link to="/portal/medical-file" className="rounded-[24px] border border-[#e7eef8] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-colors hover:border-brand-300 hover:bg-brand-50">
          <FolderOpen className="mb-2 h-5 w-5 text-brand-700" />
          <h2 className="font-black tracking-tight text-[#19233f]">{t('portal.account.medicalFile')}</h2>
          <p className="mt-1 text-sm text-[#6d7ea6]">{t('portal.account.medicalFileDesc')}</p>
        </Link>

        <Link to="/portal" className="rounded-[24px] border border-[#e7eef8] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] transition-colors hover:border-brand-300 hover:bg-brand-50">
          <ArrowRight className="mb-2 h-5 w-5 text-brand-700 rtl:rotate-180" />
          <h2 className="font-black tracking-tight text-[#19233f]">{t('portal.account.backHome')}</h2>
          <p className="mt-1 text-sm text-[#6d7ea6]">{t('portal.account.backHomeDesc')}</p>
        </Link>
      </section>
    </div>
  );
}
