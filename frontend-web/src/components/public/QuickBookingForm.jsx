import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Send, CalendarPlus, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { publicApi } from '@/lib/publicApi';

export default function QuickBookingForm() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    serviceId: '',
    branchId: '',
    scheduledAt: '',
    notes: '',
  });

  const servicesQ = useQuery({
    queryKey: ['public', 'services'],
    queryFn: () => publicApi.listServices().then((r) => r.data || []),
  });

  const branchesQ = useQuery({
    queryKey: ['public', 'branches'],
    queryFn: () => publicApi.listBranches().then((r) => r.data || []),
  });

  // Pre-select main branch once branches load
  if (branchesQ.data && !form.branchId) {
    const main = branchesQ.data.find((b) => b.isMain) || branchesQ.data[0];
    if (main) setForm((f) => ({ ...f, branchId: main._id }));
  }

  const bookMut = useMutation({
    mutationFn: (payload) => publicApi.quickBook(payload),
    onSuccess: () => {
      toast.success(t('booking.success'));
      setForm((f) => ({ ...f, fullName: '', phone: '', email: '', notes: '', scheduledAt: '' }));
    },
    onError: (err) => {
      toast.error(err.message || t('common.error'));
    },
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.branchId || !form.scheduledAt) {
      toast.error(t('common.error'));
      return;
    }
    bookMut.mutate(form);
  };

  const getServiceLabel = (s) => s.name?.[lang] || s.name?.ar || s.name?.en || '—';

  return (
    <form
      id="booking"
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-7"
      aria-label="Quick booking form"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
          <CalendarPlus className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-bold text-brand-700">{t('booking.subtitle')}</p>
          <h3 className="text-xl font-black text-ink-900">{t('booking.quickTitle')}</h3>
        </div>
      </div>

      {bookMut.isSuccess ? (
        <div className="rounded-xl bg-emerald-50 p-4 text-center">
          <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-600" />
          <p className="font-bold text-emerald-900">{t('booking.success')}</p>
          <p className="mt-1 text-sm text-emerald-700">{t('booking.successDesc')}</p>
          <button
            type="button"
            onClick={() => bookMut.reset()}
            className="btn-outline mt-4"
          >
            {t('booking.quickTitle')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Full name */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink-800">
              {t('booking.fullName')} <span className="text-rose-500">*</span>
            </label>
            <input
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              placeholder={t('booking.fullNamePlaceholder')}
              className="input"
              required
            />
          </div>

          {/* Phone + email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-ink-800">
                {t('booking.phone')} <span className="text-rose-500">*</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder={t('booking.phonePlaceholder')}
                className="input"
                dir="ltr"
                required
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
                placeholder={t('booking.emailPlaceholder')}
                className="input"
                dir="ltr"
              />
            </div>
          </div>

          {/* Service + branch */}
          <div className="grid grid-cols-2 gap-3">
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
                <option value="">{t('booking.selectService')}</option>
                {servicesQ.data?.map((s) => (
                  <option key={s._id} value={s._id}>
                    {getServiceLabel(s)}
                  </option>
                ))}
              </select>
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
                disabled={branchesQ.isLoading}
                required
              >
                <option value="">{t('booking.selectBranch')}</option>
                {branchesQ.data?.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date / time */}
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
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-ink-800">
              {t('booking.notes')}
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              placeholder={t('booking.notesPlaceholder')}
              className="input min-h-[80px] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={bookMut.isPending}
            className="btn-primary mt-2 w-full"
          >
            {bookMut.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {t('booking.submitRequest')}
          </button>
        </div>
      )}
    </form>
  );
}
