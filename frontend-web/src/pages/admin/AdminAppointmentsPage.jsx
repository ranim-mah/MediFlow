import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
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

export default function AdminAppointmentsPage() {
  const qc = useQueryClient();

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [branchId, setBranchId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'appointments', q, status, branchId],
    queryFn: () =>
      adminApi
        .listAppointments({ q, status, branchId, page: 1, limit: 80 })
        .then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus, reason }) =>
      adminApi.updateAppointmentStatus({ id, status: nextStatus, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'appointments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['admin', 'calendar'] });
    },
  });

  const items = data?.items || [];
  const branches = data?.branches || [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink-900">إدارة المواعيد</h1>
        <p className="mt-1 text-ink-500">بحث ومتابعة وتحديث حالة المواعيد بسرعة</p>
      </div>

      <div className="card">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="relative md:col-span-2">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="input ps-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث بالاسم، الهاتف أو كود المريض"
            />
          </label>

          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="confirmed">مؤكد</option>
            <option value="waiting">انتظار</option>
            <option value="in_progress">جاري</option>
            <option value="completed">منجز</option>
            <option value="cancelled">ملغي</option>
            <option value="no_show">لم يحضر</option>
          </select>

          <select className="input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">كل الفروع</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-ink-500">لا توجد مواعيد مطابقة للفلاتر الحالية.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-ink-500">
                <th className="px-3 py-2 text-start">المريض</th>
                <th className="px-3 py-2 text-start">الموعد</th>
                <th className="px-3 py-2 text-start">الخدمة</th>
                <th className="px-3 py-2 text-start">الفرع</th>
                <th className="px-3 py-2 text-start">الحالة</th>
                <th className="px-3 py-2 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id} className="border-b border-ink-50 align-top">
                  <td className="px-3 py-2">
                    <div className="font-semibold text-ink-900">{a.patientId?.fullName || '—'}</div>
                    <div className="text-xs text-ink-500" dir="ltr">
                      {a.patientId?.phone || '—'}
                    </div>
                  </td>
                  <td className="px-3 py-2">{formatDateTime(a.scheduledAt, 'ar')}</td>
                  <td className="px-3 py-2">
                    {a.serviceId?.name?.ar || a.serviceId?.name?.fr || a.serviceId?.name?.en || 'خدمة'}
                  </td>
                  <td className="px-3 py-2">{a.branchId?.name || '—'}</td>
                  <td className="px-3 py-2 font-semibold">{statusLabel[a.status] || a.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => statusMutation.mutate({ id: a._id, nextStatus: 'confirmed' })}
                        disabled={statusMutation.isPending || a.status === 'confirmed'}
                        className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
                      >
                        تأكيد
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: a._id, nextStatus: 'waiting' })}
                        disabled={statusMutation.isPending || a.status === 'waiting'}
                        className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
                      >
                        انتظار
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: a._id, nextStatus: 'completed' })}
                        disabled={statusMutation.isPending || a.status === 'completed'}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
                      >
                        إنهاء
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
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

export default function AdminAppointmentsPage() {
  const qc = useQueryClient();

  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [branchId, setBranchId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'appointments', q, status, branchId],
    queryFn: () =>
      adminApi
        .listAppointments({ q, status, branchId, page: 1, limit: 80 })
        .then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus, reason }) =>
      adminApi.updateAppointmentStatus({ id, status: nextStatus, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'appointments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['admin', 'calendar'] });
    },
  });

  const items = data?.items || [];
  const branches = data?.branches || [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink-900">إدارة المواعيد</h1>
        <p className="mt-1 text-ink-500">بحث ومتابعة وتحديث حالة المواعيد بسرعة</p>
      </div>

      <div className="card">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="relative md:col-span-2">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="input ps-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="بحث بالاسم، الهاتف أو كود المريض"
            />
          </label>

          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="confirmed">مؤكد</option>
            <option value="waiting">انتظار</option>
            <option value="in_progress">جاري</option>
            <option value="completed">منجز</option>
            <option value="cancelled">ملغي</option>
            <option value="no_show">لم يحضر</option>
          </select>

          <select className="input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">كل الفروع</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-ink-500">لا توجد مواعيد مطابقة للفلاتر الحالية.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-ink-500">
                <th className="px-3 py-2 text-start">المريض</th>
                <th className="px-3 py-2 text-start">الموعد</th>
                <th className="px-3 py-2 text-start">الخدمة</th>
                <th className="px-3 py-2 text-start">الفرع</th>
                <th className="px-3 py-2 text-start">الحالة</th>
                <th className="px-3 py-2 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id} className="border-b border-ink-50 align-top">
                  <td className="px-3 py-2">
                    <div className="font-semibold text-ink-900">{a.patientId?.fullName || '—'}</div>
                    <div className="text-xs text-ink-500" dir="ltr">
                      {a.patientId?.phone || '—'}
                    </div>
                  </td>
                  <td className="px-3 py-2">{formatDateTime(a.scheduledAt, 'ar')}</td>
                  <td className="px-3 py-2">
                    {a.serviceId?.name?.ar || a.serviceId?.name?.fr || a.serviceId?.name?.en || 'خدمة'}
                  </td>
                  <td className="px-3 py-2">{a.branchId?.name || '—'}</td>
                  <td className="px-3 py-2 font-semibold">{statusLabel[a.status] || a.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => statusMutation.mutate({ id: a._id, nextStatus: 'confirmed' })}
                        disabled={statusMutation.isPending || a.status === 'confirmed'}
                        className="rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
                      >
                        تأكيد
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: a._id, nextStatus: 'waiting' })}
                        disabled={statusMutation.isPending || a.status === 'waiting'}
                        className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
                      >
                        انتظار
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: a._id, nextStatus: 'completed' })}
                        disabled={statusMutation.isPending || a.status === 'completed'}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
                      >
                        إنهاء
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
