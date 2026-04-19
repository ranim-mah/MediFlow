import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Printer, ListOrdered, ArrowRight, IdCard, Stethoscope,
  Calendar, Activity, FileText, Building2, Loader2,
} from 'lucide-react';
import { patientApi } from '@/lib/patientApi';
import StatusBadge from '@/components/portal/StatusBadge';
import { formatDate } from '@/lib/dates';

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-[24px] border border-[#e7eef8] bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4ff] text-brand-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#6d7ea6]">{label}</p>
        <p className="mt-0.5 text-xl font-black tracking-tight text-[#19233f]">{value ?? '—'}</p>
      </div>
    </div>
  </div>
);

export default function MedicalFilePage() {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ['patient', 'medicalFile'],
    queryFn: () => patientApi.getMedicalFile().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const p = data?.patient;
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header card */}
      <section className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-bold text-brand-700">
              <FileText className="h-3.5 w-3.5" />
              {t('portal.medicalFile.updatedBadge')}
            </span>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-[#19233f] md:text-3xl">{t('portal.medicalFile.title')}</h1>
            <p className="mt-1 text-[#6d7ea6]">{t('portal.medicalFile.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/portal/medical-file/print" className="btn-primary gap-2">
              <Printer className="h-4 w-4" /> {t('portal.medicalFile.printFull')}
            </Link>
            <Link to="/portal/timeline" className="btn-outline gap-2">
              <ListOrdered className="h-4 w-4" /> {t('portal.medicalFile.showTimeline')}
            </Link>
            <Link to="/portal" className="btn-outline gap-2">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              {t('portal.medicalFile.backDashboard')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Calendar} label={t('portal.medicalFile.totalVisits')} value={stats.totalVisits ?? p?.totalVisits} />
        <StatCard icon={Activity} label={t('portal.medicalFile.procedures')} value={stats.proceduresCount} />
        <StatCard icon={Building2} label={t('portal.medicalFile.referrals')} value={stats.referralsCount} />
        <StatCard icon={Calendar} label={t('portal.medicalFile.lastVisit')}
          value={data?.lastVisitDate ? formatDate(data.lastVisitDate, i18n.language) : '—'} />
      </div>

      {/* Basic info + summary (matches image 5 center) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
          <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-[#19233f]">
            <IdCard className="h-5 w-5 text-brand-700" />
            {t('portal.medicalFile.basicInfo')}
          </h2>
          <dl className="mt-5 space-y-4">
            <InfoRow label={t('portal.medicalFile.name')} value={p?.fullName} />
            <InfoRow label={t('portal.medicalFile.phone')} value={p?.phone} dir="ltr" />
            <InfoRow label={t('portal.medicalFile.email')} value={p?.email} dir="ltr" />
          </dl>
        </section>

        <section className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
          <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-[#19233f]">
            <Stethoscope className="h-5 w-5 text-brand-700" />
            {t('portal.medicalFile.quickHealthSummary')}
          </h2>
          <p className="mt-1 text-sm text-[#6d7ea6]">{t('portal.medicalFile.quickHealthDesc')}</p>
          <div className="mt-4 rounded-[22px] bg-[#fbfdff] p-4">
            {p?.healthSummary ? (
              <p className="text-sm text-[#1d2a46]">{p.healthSummary}</p>
            ) : (
              <p className="text-center text-sm text-[#6d7ea6]">{t('portal.medicalFile.noSummary')}</p>
            )}
          </div>

          {/* Flags */}
          {(p?.flags?.length > 0 || p?.isChronic || p?.isHighRisk) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {p.isHighRisk && (
                <span className="badge bg-rose-100 text-rose-800">High risk</span>
              )}
              {p.isChronic && <span className="badge bg-amber-100 text-amber-800">Chronic</span>}
              {p.flags?.map((f, i) => (
                <span key={i} className="badge bg-ink-100 text-ink-700">{f}</span>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Visits log */}
      <section className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-[#19233f]">
              <Stethoscope className="h-5 w-5 text-brand-700" />
              {t('portal.medicalFile.visitsLog')}
            </h2>
            <p className="mt-1 text-sm text-[#6d7ea6]">{t('portal.medicalFile.last50')}</p>
          </div>
        </div>

        {!data?.visits?.length ? (
          <div className="rounded-[22px] border border-[#e7eef8] bg-[#fbfdff] p-8 text-center text-sm text-[#6d7ea6]">
            {t('common.noData')}
          </div>
        ) : (
          <div className="space-y-2">
            {data.visits.map((v) => (
              <div
                key={v._id}
                className="flex flex-col gap-2 rounded-[22px] border border-[#e7eef8] bg-[#fbfdff] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold tracking-tight text-[#19233f]">
                    {v.serviceId?.name?.[i18n.language] || v.diagnosis || '—'}
                  </p>
                  {v.doctorId?.userId?.fullName && (
                    <p className="text-sm text-[#6d7ea6]">د / {v.doctorId.userId.fullName}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={v.status === 'in_session' ? 'in_progress' : v.status} />
                  <span className="text-sm font-bold text-[#5e6d89]" dir="ltr">
                    {formatDate(v.visitDate, i18n.language)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoRow({ label, value, dir }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-sm font-semibold text-[#6d7ea6]">{label}</dt>
      <dd className="font-bold text-[#19233f]" dir={dir}>{value || '—'}</dd>
    </div>
  );
}
