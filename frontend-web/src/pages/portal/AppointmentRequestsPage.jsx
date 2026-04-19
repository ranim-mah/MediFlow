import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, ArrowRight, CalendarPlus } from 'lucide-react';

export default function AppointmentRequestsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-bold text-brand-700">
          <ClipboardList className="h-3.5 w-3.5" />
          {t('portal.appointments.modifyRequests')}
        </span>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-[#19233f] md:text-3xl">
          {t('portal.appointments.modifyRequests')}
        </h1>
        <p className="mt-1 text-[#6d7ea6]">This page groups appointment changes, adjustments and follow-up requests.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/portal/appointments" className="btn-outline gap-2">
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            {t('portal.appointments.title')}
          </Link>
          <Link to="/portal/appointments/new" className="btn-primary gap-2">
            <CalendarPlus className="h-4 w-4" />
            {t('portal.appointments.new')}
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
        <h2 className="text-lg font-black tracking-tight text-[#19233f]">No pending requests yet</h2>
        <p className="mt-2 text-sm text-[#6d7ea6]">
          You can request changes from any appointment card in the appointments page.
        </p>
      </section>
    </div>
  );
}
