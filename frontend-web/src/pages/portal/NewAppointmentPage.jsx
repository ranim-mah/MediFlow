import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, Info, Loader2, CalendarPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { publicApi } from '@/lib/publicApi';
import { patientApi } from '@/lib/patientApi';

export default function NewAppointmentPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language;

  const [form, setForm] = useState({ serviceId: '', branchId: '', scheduledAt: '', notes: '' });

  const servicesQ = useQuery({
    queryKey: ['public', 'services'],
    queryFn: () => publicApi.listServices().then((r) => r.data || []),
  });
  const branchesQ = useQuery({
    queryKey: ['public', 'branches'],
    queryFn: () => publicApi.listBranches().then((r) => r.data || []),
  });

  if (branchesQ.data && !form.branchId) {
    const main = branchesQ.data.find((b) => b.isMain) || branchesQ.data[0];
    if (main) setForm((f) => ({ ...f, branchId: main._id }));
  }

  const bookMut = useMutation({
    mutationFn: (payload) => patientApi.createAppointment(payload),
    onSuccess: () => {
      toast.success(t('portal.appointments.bookingCreated'));
      navigate('/portal/appointments');
    },
    onError: (err) => toast.error(err.message || t('common.error')),
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.branchId || !form.scheduledAt) {
      toast.error(t('common.error'));
      return;
    }
    bookMut.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black md:text-3xl">
            <CalendarPlus className="inline h-7 w-7 text-brand-700 me-2" />
            {t('portal.appointments.addNew')}
          </h1>
          <p className="mt-1 text-ink-500">{t('portal.appointments.addNewDesc')}</p>
        </div>
        <Link to="/portal/appointments" className="btn-outline text-sm">
          {t('portal.nav.appointments')}
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-card md:col-span-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink-800">
              {t('booking.service')}
            </label>
            <select
              name="serviceId"
              value={form.serviceId}
              onChange={onChange}
              className="input"
              disabled={servicesQ.isLoading}
            >
              <option value="">-- {t('booking.selectService')} --</option>
              {servicesQ.data?.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name?.[lang] || s.name?.ar}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-500">{t('portal.appointments.selectService')}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-ink-800">
              {t('booking.branch')} <span className="text-rose-500">*</span>
            </label>
            <select
              name="branchId"
              value={form.branchId}
              onChange={onChange}
              className="input"
              required
            >
              <option value="">-- {t('booking.selectBranch')} --</option>
              {branchesQ.data?.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-500">{t('portal.appointments.branchHint')}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-ink-800">
              {t('booking.dateTime')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={form.scheduledAt}
              onChange={onChange}
              className="input"
              min={new Date().toISOString().slice(0, 16)}
              dir="ltr"
              required
            />
            <p className="mt-1 text-xs text-ink-500">{t('portal.appointments.dateHint')}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-ink-800">
              {t('booking.notes')} <span className="text-ink-400">({t('common.optional')})</span>
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              className="input min-h-[100px] resize-none"
            />
          </div>

          <button type="submit" disabled={bookMut.isPending} className="btn-primary">
            {bookMut.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            {t('portal.appointments.confirmBooking')}
          </button>
        </form>

        {/* Reminders sidebar */}
        <aside className="space-y-3 rounded-2xl bg-white p-6 shadow-card">
          <h3 className="flex items-center gap-2 text-lg font-black">
            <Info className="h-5 w-5 text-brand-700" />
            {t('portal.appointments.reminders')}
          </h3>
          <ul className="space-y-2 text-sm text-ink-600">
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              {t('portal.appointments.reminder1')}
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              {t('portal.appointments.reminder2')}
            </li>
            <li className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
              {t('portal.appointments.reminder3')}
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
