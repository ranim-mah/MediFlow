import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { formatDateTime } from '@/lib/dates';

const statusLabel = {
  pending: 'قيد المراجعة',
  confirmed: 'مؤكد',
  waiting: 'انتظار',
  in_progress: 'جاري',
  completed: 'منجز',
  cancelled: 'ملغي',
  no_show: 'لم يحضر',
};

const toMonthRange = (monthValue) => {
  const [y, m] = monthValue.split('-').map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
};

export default function AdminCalendarPage() {
  const qc = useQueryClient();
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [branchId, setBranchId] = useState('');

  const range = toMonthRange(month);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'calendar', month, branchId],
    queryFn: () => adminApi.getCalendar({ ...range, branchId }).then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }) => adminApi.updateAppointmentStatus({ id, status, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'calendar'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  const branches = data?.branches || [];
  const events = data?.events || [];
  const countsByDay = data?.countsByDay || {};

  const sortedDays = useMemo(() => Object.keys(countsByDay).sort(), [countsByDay]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink-900">روزنامة المواعيد</h1>
        <p className="mt-1 text-ink-500">عرض مواعيد الشهر مع توزيع يومي</p>
      </div>

      <div className="card">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-ink-600">الشهر</label>
            <input type="month" className="input" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink-600">الفرع</label>
            <select className="input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
              <option value="">كل الفروع</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="rounded-xl bg-brand-50 p-3 text-sm text-brand-800">
            إجمالي المواعيد في النطاق: <strong>{events.length}</strong>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h2 className="mb-3 text-lg font-black">توزيع يومي</h2>
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          ) : sortedDays.length === 0 ? (
            <p className="text-ink-500">لا توجد بيانات في هذا الشهر.</p>
          ) : (
            <div className="space-y-2 text-sm">
              {sortedDays.map((d) => (
                <div key={d} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2">
                  <span>{d}</span>
                  <strong>{countsByDay[d]}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card lg:col-span-2">
          <h2 className="mb-3 text-lg font-black">المواعيد</h2>
          {isLoading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-ink-500">لا توجد مواعيد في النطاق الحالي.</p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 80).map((e) => (
                <div key={e._id} className="rounded-xl border border-ink-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-ink-900">{e.patient?.fullName || '—'}</p>
                    <span className="text-sm text-ink-500">{formatDateTime(e.scheduledAt, 'ar')}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">
                    {e.service?.name?.ar || e.service?.name?.fr || e.service?.name?.en || 'خدمة'}
                    {' · '}
                    {e.doctor || 'بدون طبيب'}
                    {' · '}
                    {e.branch?.name || '—'}
                    {' · '}
                    <span className="font-semibold">{statusLabel[e.status] || e.status}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => statusMutation.mutate({ id: e._id, status: 'confirmed' })}
                      disabled={statusMutation.isPending || e.status === 'confirmed'}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      تأكيد
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: e._id, status: 'waiting' })}
                      disabled={statusMutation.isPending || e.status === 'waiting'}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      انتظار
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: e._id, status: 'cancelled', reason: 'Annule depuis calendrier admin' })}
                      disabled={statusMutation.isPending || e.status === 'cancelled'}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}