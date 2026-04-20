import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Calendar, DollarSign, Receipt, TrendingUp, FileText, Plus,
  UserPlus, FilePlus, Activity, BarChart3, CreditCard, Star, Search,
  ClipboardList, Info, HelpCircle, BookOpen, Loader2,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { adminApi } from '@/lib/adminApi';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/lib/dates';

const KpiMini = ({ label, value, tone = 'default' }) => {
  const tones = {
    default: 'bg-white text-ink-900',
    rose: 'bg-rose-50 text-rose-900 border-l-4 border-rose-400',
    amber: 'bg-amber-50 text-amber-900 border-l-4 border-amber-400',
    emerald: 'bg-emerald-50 text-emerald-900 border-l-4 border-emerald-400',
    blue: 'bg-blue-50 text-blue-900 border-l-4 border-blue-400',
  };
  return (
    <div className={`rounded-2xl p-4 shadow-card ${tones[tone]}`}>
      <p className="text-sm font-semibold opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
};

const QuickAction = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft"
  >
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
      <Icon className="h-5 w-5" />
    </div>
    <span className="text-sm font-bold text-ink-800">{label}</span>
  </Link>
);

export default function AdminDashboardPage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard().then((r) => r.data),
  });

  const kpis = data?.kpis || {};
  const chartData = (data?.chart?.services || []).map((row, i) => ({
    day: row.day,
    services: row.count,
    operations: data.chart.operations[i]?.count || 0,
    newPatients: data.chart.newPatients[i]?.count || 0,
  }));

  return (
    <div className="space-y-6">
      {/* About box */}
      <section className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-ink-500">
              <Info className="h-4 w-4" />
              {t('admin.aboutPage')}
            </div>
            <p className="text-sm text-ink-600">{t('admin.dashboard.aboutDesc')}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline gap-1 text-xs">
              <BookOpen className="h-3.5 w-3.5" /> {t('admin.quickGuide')}
            </button>
            <button className="btn-primary gap-1 text-xs">
              <HelpCircle className="h-3.5 w-3.5" /> {t('admin.helpCenter')}
            </button>
          </div>
        </div>
      </section>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-black md:text-3xl">{t('admin.dashboard.title')}</h1>
        <p className="mt-1 text-ink-500">{t('admin.dashboard.subtitle')}</p>
      </div>

      {/* Welcome card */}
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-ink-500">صباح الخير</p>
            <h2 className="mt-1 text-2xl font-black">
              {t('admin.dashboard.welcome')} {user?.fullName}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-600">
              <span>
                <span className="font-semibold">{t('admin.dashboard.currentRole')} : </span>
                <span className="font-bold text-brand-700">{t('admin.dashboard.systemManager')}</span>
              </span>
              <span className="text-ink-300">•</span>
              <span>
                <span className="font-semibold">{t('admin.dashboard.today')} : </span>
                <span className="font-bold" dir="ltr">{formatDate(new Date(), i18n.language)}</span>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <span className="text-ink-600">
                {t('admin.dashboard.newPatientsToday')} : <b>{kpis.newPatientsThisMonth || 0}</b>
              </span>
              <span className="text-ink-300">•</span>
              <span className="text-ink-600">
                {t('admin.dashboard.invoicesToday')} : <b>{kpis.todayInvoicesCount || 0}</b>
              </span>
              <span className="text-ink-300">•</span>
              <span className="text-ink-600">
                {t('admin.dashboard.netToday')} : <b dir="ltr">{(kpis.todayCollected || 0).toFixed(2)}</b>
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to="/admin/appointments" className="btn-primary gap-2">
              <Calendar className="h-4 w-4" /> {t('admin.dashboard.appointmentsBtn')}
            </Link>
            <Link to="/admin/patients" className="btn-outline gap-2">
              <Users className="h-4 w-4" /> {t('admin.dashboard.patientsBtn')}
            </Link>
          </div>
        </div>

        {/* Search row */}
        <div className="mt-6 rounded-2xl border border-ink-200 p-4">
          <p className="text-sm font-bold">{t('admin.dashboard.searchPrompt')}</p>
          <p className="mt-1 text-xs text-ink-500">{t('admin.dashboard.searchHint')}</p>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 start-3" />
              <input
                placeholder={t('admin.dashboard.searchPlaceholder')}
                className="input ps-10"
              />
            </div>
            <button className="btn bg-ink-900 text-white hover:bg-ink-800">
              {t('admin.dashboard.searchBtn')}
            </button>
          </div>
        </div>
      </section>

      {/* Quick actions grid (image 10 top) */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
        <QuickAction to="/admin/appointments" icon={Calendar} label={t('admin.dashboard.addAppointment')} />
        <QuickAction to="/admin/patients/new" icon={UserPlus} label={t('admin.dashboard.newPatient')} />
        <QuickAction to="/admin/invoices/new" icon={FilePlus} label={t('admin.dashboard.newInvoice')} />
        <QuickAction to="/admin/procedures" icon={Activity} label={t('admin.dashboard.addProcedure')} />
        <QuickAction to="/admin/reports" icon={BarChart3} label={t('admin.dashboard.reports')} />
        <QuickAction to="/admin/payments" icon={CreditCard} label={t('admin.dashboard.payments')} />
        <QuickAction to="/admin/reviews" icon={Star} label={t('admin.dashboard.clientReviews')} />
      </div>

      {/* KPI row (4 big cards from image 10 bottom) */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="card border-l-4 border-brand-500">
          <p className="text-sm text-ink-500">{t('admin.dashboard.totalPatients')}</p>
          <p className="mt-1 text-3xl font-black">{kpis.totalPatients ?? '—'}</p>
          <p className="mt-1 text-xs text-ink-400">{t('admin.dashboard.patientsDbTotal')}</p>
          <Link to="/admin/patients" className="btn-ghost mt-3 px-0 text-xs text-brand-700">
            {t('admin.dashboard.view')}
          </Link>
        </div>
        <div className="card border-l-4 border-emerald-500">
          <p className="text-sm text-ink-500">{t('admin.dashboard.todayAppointments')}</p>
          <p className="mt-1 text-3xl font-black">{kpis.todayAppointments ?? 0}</p>
          <p className="mt-1 text-xs text-ink-400">
            {!kpis.todayAppointments ? t('admin.dashboard.noAppointmentsToday') : t('admin.dashboard.openCalendar')}
          </p>
          <Link to="/admin/appointments" className="btn-ghost mt-3 px-0 text-xs text-emerald-700">
            <Calendar className="h-3.5 w-3.5 me-1 inline" />
            {t('admin.dashboard.openList')}
          </Link>
        </div>
        <div className="card border-l-4 border-amber-500">
          <p className="text-sm text-ink-500">{t('admin.dashboard.upcomingAppointments')}</p>
          <p className="mt-1 text-3xl font-black">{kpis.upcomingAppointments ?? 0}</p>
          <p className="mt-1 text-xs text-ink-400">{t('admin.dashboard.nextPeriod')}</p>
          <Link to="/admin/appointments" className="btn-ghost mt-3 px-0 text-xs text-amber-700">
            {t('admin.dashboard.openList')}
          </Link>
        </div>
        <div className="card border-l-4 border-rose-500">
          <p className="text-sm text-ink-500">{t('admin.dashboard.todayCollection')}</p>
          <p className="mt-1 text-3xl font-black" dir="ltr">{(kpis.todayCollected || 0).toFixed(2)}</p>
          <p className="mt-1 text-xs text-ink-400">
            {!kpis.todayCollected ? t('admin.dashboard.noRevenueToday') : t('admin.dashboard.details')}
          </p>
          <Link to="/admin/invoices/new" className="btn-ghost mt-3 px-0 text-xs text-rose-700">
            <FilePlus className="h-3.5 w-3.5 me-1 inline" />
            {t('admin.dashboard.addInvoice')}
          </Link>
        </div>
      </div>

      {/* Monthly revenue + expenses row (image 13) */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-ink-500">{t('admin.dashboard.monthlyRevenue')}</p>
              <p className="mt-2 text-3xl font-black" dir="ltr">{(kpis.monthRevenue || 0).toFixed(2)}</p>
              <p className="mt-1 text-xs text-ink-400">{t('admin.dashboard.monthlyInvoicesTotal')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <button className="btn-ghost mt-3 px-0 text-xs text-brand-700">
            {t('admin.dashboard.view')}
          </button>
        </div>
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-ink-500">{t('admin.dashboard.monthlyExpenses')}</p>
              <p className="mt-2 text-3xl font-black" dir="ltr">0.00</p>
              <p className="mt-1 text-xs text-ink-400">{t('admin.dashboard.currentMonthExpenses')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <button className="btn-ghost mt-3 px-0 text-xs text-brand-700">
            {t('admin.dashboard.view')}
          </button>
        </div>
      </div>

      {/* Monthly chart (image 13) */}
      <section className="card">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black">
              <TrendingUp className="h-5 w-5 text-brand-700" />
              {t('admin.dashboard.monthlyIndicator')}
            </h2>
            <p className="mt-1 text-sm text-ink-500">{t('admin.dashboard.monthlyChartDesc')}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="gServices" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b93f6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3b93f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="services"
                  name={t('admin.dashboard.servicesCount')}
                  stroke="#3b93f6"
                  strokeWidth={2}
                  fill="url(#gServices)"
                />
                <Area
                  type="monotone"
                  dataKey="operations"
                  name={t('admin.dashboard.operationsCount')}
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="#ef4444"
                  fillOpacity={0.1}
                />
                <Area
                  type="monotone"
                  dataKey="newPatients"
                  name={t('admin.dashboard.newPatients')}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="#f59e0b"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Recent operations + Most used services */}
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <Activity className="h-5 w-5 text-brand-700" />
              {t('admin.dashboard.recentOperations')}
            </h2>
            <Link to="/admin/procedures" className="text-sm font-bold text-brand-700 hover:underline">
              {t('admin.dashboard.viewOperations')}
            </Link>
          </div>
          {(data?.recentOperations || []).length === 0 ? (
            <div className="rounded-xl bg-ink-50 p-6 text-center text-sm text-ink-500">
              {t('admin.dashboard.noOperations')}
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentOperations.map((op) => (
                <div key={op._id} className="flex items-center justify-between rounded-xl border border-ink-200 p-3">
                  <div>
                    <p className="font-bold text-ink-900">{op.patientId?.fullName}</p>
                    <p className="text-sm text-ink-500">{op.name}</p>
                  </div>
                  <span className="text-xs text-ink-500" dir="ltr">
                    {formatDate(op.performedAt, i18n.language)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <div className="mb-4">
            <h2 className="flex items-center gap-2 text-lg font-black">
              <ClipboardList className="h-5 w-5 text-brand-700" />
              {t('admin.dashboard.mostUsedServices')}
            </h2>
          </div>
          <div className="text-sm">
            <div className="grid grid-cols-3 gap-2 border-b border-ink-200 pb-2 font-bold text-ink-500">
              <span>{t('admin.dashboard.service')}</span>
              <span>{t('admin.dashboard.repetition')}</span>
              <span>{t('admin.dashboard.activity')}</span>
            </div>
            <div className="py-8 text-center text-ink-400">
              {t('admin.dashboard.latestData')}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}