import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { doctorApi } from '@/lib/doctorApi';
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

function KpiCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-ink-900">{value}</p>
    </div>
  );
}

export default function DoctorFocusPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', 'focus'],
    queryFn: () => doctorApi.getFocus().then((r) => r.data.data),
  });

  const list = useMemo(() => {
    const items = data?.nextAppointments || [];
    if (!status) return items;
    return items.filter((x) => x.status === status);
  }, [data, status]);

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }) => doctorApi.updateAppointmentStatus({ id, status: nextStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doctor', 'focus'] });
      qc.invalidateQueries({ queryKey: ['doctor', 'appointments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['admin', 'appointments'] });
      qc.invalidateQueries({ queryKey: ['admin', 'calendar'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink-900">Doctor Focus Mode</h1>
        <p className="mt-1 text-ink-500">{data?.doctor?.fullName || 'Doctor'} - {data?.doctor?.specialty || 'General'}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <KpiCard label="مواعيد اليوم" value={data?.kpis?.todayTotal || 0} />
        <KpiCard label="في الانتظار" value={data?.kpis?.waitingCount || 0} />
        <KpiCard label="جاري الآن" value={data?.kpis?.inProgressCount || 0} />
        <KpiCard label="مكتمل اليوم" value={data?.kpis?.doneCount || 0} />
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-ink-900">قائمة المواعيد القادمة</h2>
          <select className="input max-w-[220px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="confirmed">مؤكد</option>
            <option value="waiting">انتظار</option>
            <option value="in_progress">جاري</option>
          </select>
        </div>

        {list.length === 0 ? (
          <p className="text-ink-500">لا توجد مواعيد مطابقة حاليا.</p>
        ) : (
          <div className="space-y-2">
            {list.map((a) => (
              <div key={a._id} className="rounded-xl border border-ink-100 bg-white p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-ink-900">{a.patientId?.fullName || '—'}</p>
                    <p className="text-xs text-ink-500">{formatDateTime(a.scheduledAt, 'ar')} - {statusLabel[a.status] || a.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, nextStatus: 'waiting' })}
                      disabled={statusMutation.isPending || a.status === 'waiting'}
                      className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
                    >
                      انتظار
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, nextStatus: 'in_progress' })}
                      disabled={statusMutation.isPending || a.status === 'in_progress'}
                      className="rounded-lg bg-sky-600 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
                    >
                      بدء
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, nextStatus: 'completed' })}
                      disabled={statusMutation.isPending || a.status === 'completed'}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
                    >
                      إنهاء
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, nextStatus: 'no_show' })}
                      disabled={statusMutation.isPending || a.status === 'no_show'}
                      className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
                    >
                      غياب
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
