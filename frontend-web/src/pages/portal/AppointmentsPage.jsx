import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, CalendarX, Pencil, Calendar, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientApi } from '@/lib/patientApi';
import StatusBadge from '@/components/portal/StatusBadge';
import { formatDateTime } from '@/lib/dates';

export default function AppointmentsPage() {
  const { t, i18n } = useTranslation();
  const [scope, setScope] = useState('all');
  const qc = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['patient', 'appointments', scope],
    queryFn: () => patientApi.listAppointments(scope).then((r) => r.data),
  });

  const cancelMut = useMutation({
    mutationFn: (id) => patientApi.cancelAppointment(id),
    onSuccess: () => {
      toast.success(t('portal.appointments.cancelledSuccess'));
      qc.invalidateQueries({ queryKey: ['patient'] });
    },
    onError: (err) => toast.error(err.message || t('common.error')),
  });

  const onCancel = (id) => {
    if (confirm(t('portal.appointments.cancelConfirm'))) cancelMut.mutate(id);
  };

  const upcoming = appointments.filter(
    (a) => !['completed', 'cancelled'].includes(a.status) && new Date(a.scheduledAt) >= new Date()
  );
  const past = appointments.filter(
    (a) => ['completed', 'cancelled'].includes(a.status) || new Date(a.scheduledAt) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black md:text-3xl">
            <Calendar className="inline h-7 w-7 text-brand-700 me-2" />
            {t('portal.appointments.title')}
          </h1>
          <p className="mt-1 text-ink-500">{t('portal.appointments.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn bg-amber-400 text-amber-950 hover:bg-amber-300">
            <ClipboardList className="h-4 w-4" /> {t('portal.appointments.modifyRequests')}
          </button>
          <button className="btn-outline">
            <Calendar className="h-4 w-4" /> {t('portal.appointments.calendar')}
          </button>
          <Link to="/portal/appointments/new" className="btn-primary">
            <CalendarPlus className="h-4 w-4" /> {t('portal.appointments.new')}
          </Link>
        </div>
      </div>

      {/* Scope tabs */}
      <div className="inline-flex rounded-xl bg-white p-1 shadow-card">
        {['all', 'upcoming', 'past'].map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-colors ${
              scope === s ? 'bg-brand-600 text-white' : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            {t(`portal.appointments.${s}`)}
          </button>
        ))}
      </div>

      {/* Upcoming block */}
      {(scope === 'all' || scope === 'upcoming') && (
        <section className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-black">{t('portal.appointments.upcoming')}</h2>
          {upcoming.length === 0 ? (
            <EmptyState text={t('portal.appointments.noAppointments')} />
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => (
                <AppointmentRow
                  key={a._id}
                  appointment={a}
                  onCancel={onCancel}
                  lang={i18n.language}
                  t={t}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Past block */}
      {(scope === 'all' || scope === 'past') && (
        <section className="rounded-2xl bg-white p-6 shadow-card">
          <h2 className="mb-4 text-lg font-black">{t('portal.appointments.past')}</h2>
          {past.length === 0 ? (
            <EmptyState text={t('portal.appointments.noAppointments')} />
          ) : (
            <div className="space-y-3">
              {past.map((a) => (
                <AppointmentRow
                  key={a._id}
                  appointment={a}
                  readOnly
                  lang={i18n.language}
                  t={t}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function AppointmentRow({ appointment, onCancel, readOnly, lang, t }) {
  const doctor = appointment.doctorId?.userId?.fullName;
  const service = appointment.serviceId?.name?.[lang] || appointment.serviceId?.name?.ar;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-20 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-800">
          <span className="text-xs font-semibold" dir="ltr">
            {new Date(appointment.scheduledAt).toLocaleDateString('en-GB')}
          </span>
          <span className="text-sm font-black" dir="ltr">
            {new Date(appointment.scheduledAt).toTimeString().slice(0, 5)}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-black text-ink-900">{service || '—'}</h3>
          {doctor && <p className="text-sm text-ink-500">د / {doctor}</p>}
          <div className="mt-2">
            <StatusBadge status={appointment.status} />
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost gap-1 px-3 py-1.5 text-xs">
            <Pencil className="h-3.5 w-3.5" /> {t('portal.appointments.requestModify')}
          </button>
          <button
            onClick={() => onCancel(appointment._id)}
            className="btn gap-1 border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
          >
            <CalendarX className="h-3.5 w-3.5" /> {t('portal.appointments.cancel')}
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-xl bg-ink-50 p-6 text-center text-sm text-ink-500">
      {text}
    </div>
  );
}
