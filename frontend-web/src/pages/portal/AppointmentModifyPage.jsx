import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarX, ArrowRight } from 'lucide-react';

export default function AppointmentModifyPage() {
  const { appointmentId } = useParams();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-bold text-brand-700">
          <CalendarX className="h-3.5 w-3.5" />
          {t('portal.appointments.requestModify')}
        </span>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-[#19233f] md:text-3xl">
          {t('portal.appointments.requestModify')}
        </h1>
        <p className="mt-1 text-[#6d7ea6]">Appointment ID: {appointmentId}</p>
        <p className="mt-3 text-sm text-[#6d7ea6]">
          This destination is ready for the next step of the modification workflow.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/portal/appointments" className="btn-outline gap-2">
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            {t('portal.appointments.title')}
          </Link>
        </div>
      </section>
    </div>
  );
}
