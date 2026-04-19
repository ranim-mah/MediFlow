import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarPlus, FolderOpen, User, Bell, FileEdit, FlaskConical,
  Activity, Calendar, Download, ArrowRight, Sliders,
} from 'lucide-react';
import { patientApi } from '@/lib/patientApi';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime, formatDate } from '@/lib/dates';

const StatBox = ({ label, value }) => (
  <div className="rounded-2xl bg-white p-5 text-center shadow-card">
    <p className="text-sm font-semibold text-ink-500">{label}</p>
    <p className="mt-1 text-3xl font-black text-ink-900">{value}</p>
  </div>
);

const ShortcutCard = ({ to, icon: Icon, label, desc, tone = 'neutral' }) => {
  const tones = {
    brand: 'bg-brand-600 text-white',
    neutral: 'bg-white text-ink-900',
  };
  return (
    <Link
      to={to}
      className={`flex items-start justify-between rounded-2xl p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft ${tones[tone]}`}
    >
      <div>
        <h3 className="text-lg font-black">{label}</h3>
        <p className={`mt-1 text-sm ${tone === 'brand' ? 'text-white/80' : 'text-ink-500'}`}>
          {desc}
        </p>
      </div>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
          tone === 'brand' ? 'bg-white/20' : 'bg-brand-100 text-brand-700'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </Link>
  );
};

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['patient', 'dashboard'],
    queryFn: () => patientApi.getDashboard().then((r) => r.data),
  });

  const p = data?.patient;
  const stats = data?.stats || {};
  const next = data?.nextAppointment;
  const recent = data?.recent || {};

  return (
    <div className="space-y-6">
      {/* Top 4 shortcut cards (matches row in image 3) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ShortcutCard
          to="/portal/appointments/new"
          icon={CalendarPlus}
          label={t('portal.dashboard.newBooking')}
          desc={t('portal.dashboard.newBookingDesc')}
          tone="brand"
        />
        <ShortcutCard
          to="/portal/medical-file"
          icon={FolderOpen}
          label={t('portal.dashboard.myFiles')}
          desc={t('portal.dashboard.myFilesDesc')}
        />
        <ShortcutCard
          to="/portal/notifications"
          icon={User}
          label={t('portal.dashboard.myAccount')}
          desc={t('portal.dashboard.myAccountDesc')}
        />
        <ShortcutCard
          to="/portal/notifications"
          icon={Bell}
          label={t('portal.dashboard.alerts')}
          desc={t('portal.dashboard.alertsDesc')}
        />
      </div>

      {/* Welcome + stats grid */}
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-black md:text-3xl">
              {t('portal.dashboard.hello')} {user?.fullName} <span>👋</span>
            </h1>
            <p className="mt-1 text-ink-500">{t('portal.dashboard.tagline')}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox label={t('portal.dashboard.pastVisits')} value={stats.past ?? '—'} />
          <StatBox label={t('portal.dashboard.upcomingAppointments')} value={stats.upcoming ?? '—'} />
          <StatBox label={t('portal.dashboard.prescriptions')} value={stats.prescriptions ?? '—'} />
          <StatBox label={t('portal.dashboard.labsRadio')} value={(stats.labs || 0) + (stats.radiology || 0)} />
        </div>

        {/* Next appointment */}
        {next && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-ink-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-brand-700">{t('portal.dashboard.nextAppointment')}</p>
              <p className="mt-1 font-black text-ink-900" dir="ltr">
                {formatDateTime(next.scheduledAt, i18n.language)}
              </p>
              <p className="text-sm text-ink-500">
                {next.doctorId?.userId?.fullName} • {next.serviceId?.name?.[i18n.language] || next.serviceId?.name?.ar}
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/portal/appointments" className="btn-outline gap-2">
                <Calendar className="h-4 w-4" />
                {t('portal.dashboard.allAppointments')}
              </Link>
              <Link to="/portal/appointments/new" className="btn-primary gap-2">
                <CalendarPlus className="h-4 w-4" />
                {t('portal.dashboard.newBooking')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 2-column area: quick summary + notifications */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quick summary */}
        <section className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2">
                <span className="text-amber-500">⚡</span>
                {t('portal.dashboard.quickSummary')}
              </h2>
              <p className="mt-1 text-sm text-ink-500">{t('portal.dashboard.quickSummaryDesc')}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-ink-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-bold">
                <Download className="h-4 w-4 text-brand-700" />
                {t('portal.dashboard.filesCenter')}
              </h3>
              <span className="text-2xl font-black text-ink-900">{stats.totalFiles ?? 0}</span>
            </div>
            <p className="text-sm text-ink-500">{t('portal.dashboard.filesCenterDesc')}</p>
            <div className="mt-3 flex gap-2">
              <Link to="/portal/medical-file" className="btn-outline text-xs">
                {t('portal.dashboard.myFiles')}
              </Link>
              <Link to="/portal/timeline" className="btn-outline text-xs">
                {t('portal.nav.timeline')}
              </Link>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <MiniRow label={t('portal.dashboard.lastPrescription')}
              value={recent.lastPrescription ? formatDate(recent.lastPrescription.issuedAt, i18n.language) : t('portal.dashboard.none')} />
            <MiniRow label={t('portal.dashboard.lastLab')}
              value={recent.lastLab ? formatDate(recent.lastLab.requestedAt, i18n.language) : t('portal.dashboard.none')} />
            <MiniRow label={t('portal.dashboard.lastRadiology')}
              value={recent.lastRadiology ? formatDate(recent.lastRadiology.requestedAt, i18n.language) : t('portal.dashboard.none')} />
          </div>
        </section>

        {/* Notifications panel */}
        <section className="rounded-2xl bg-white p-6 shadow-card">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2">
                <Bell className="h-5 w-5 text-brand-700" />
                {t('portal.dashboard.notificationsTitle')}
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                {stats.unreadNotifications || 0} {t('portal.dashboard.unreadNotifications')}
              </p>
            </div>
            <span className="text-3xl font-black text-ink-900">{stats.unreadNotifications ?? 0}</span>
          </div>
          <Link to="/portal/notifications" className="btn-outline mt-4 gap-2">
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            {t('portal.dashboard.openNotifications')}
          </Link>
        </section>
      </div>

      {/* Shortcuts grid */}
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="mb-4">
          <h2 className="text-xl font-black flex items-center gap-2">
            <span>🔗</span> {t('portal.dashboard.shortcuts')}
          </h2>
          <p className="mt-1 text-sm text-ink-500">{t('portal.dashboard.shortcutsDesc')}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink to="/portal/medical-file" icon={FolderOpen} label={t('portal.dashboard.medicalFile')} />
          <QuickLink to="/portal/appointments/new" icon={CalendarPlus} label={t('portal.dashboard.newBooking')} />
          <QuickLink to="/portal/timeline" icon={FileEdit} label={t('portal.dashboard.prescriptions')} />
          <QuickLink to="/portal/timeline" icon={FlaskConical} label={t('portal.dashboard.labs')} />
          <QuickLink to="/portal/timeline" icon={Activity} label={t('portal.dashboard.radiology')} />
          <QuickLink to="/portal/notifications" icon={Sliders} label={t('portal.dashboard.preferences')} />
        </div>
      </section>
    </div>
  );
}

function MiniRow({ label, value }) {
  return (
    <div className="rounded-xl border border-ink-200 p-3">
      <p className="text-xs font-bold text-ink-500">{label}</p>
      <p className="mt-1 font-bold text-ink-800">{value}</p>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-2xl border border-ink-200 bg-ink-50 p-4 transition-colors hover:border-brand-400 hover:bg-brand-50"
    >
      <span className="font-bold text-ink-800">{label}</span>
      <Icon className="h-5 w-5 text-brand-700" />
    </Link>
  );
}
