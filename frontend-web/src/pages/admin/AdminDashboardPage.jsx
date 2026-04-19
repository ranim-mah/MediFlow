import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, UserCog, UserRoundCheck, CalendarClock, Loader2 } from 'lucide-react';
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

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-ink-500">{label}</span>
        <Icon className="h-5 w-5 text-brand-700" />
      </div>
      <p className="text-2xl font-black text-ink-900">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard().then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }) => adminApi.updateAppointmentStatus({ id, status, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['admin', 'calendar'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const k = data?.kpis || {};
  const upcoming = data?.upcomingAppointments || [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink-900">لوحة تحكم الإدارة</h1>
        <p className="mt-1 text-ink-500">نظرة سريعة على حالة العيادة اليوم</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي المرضى" value={k.totalPatients || 0} icon={Users} />
        <StatCard label="الأطباء" value={k.totalDoctors || 0} icon={UserRoundCheck} />
        <StatCard label="الموظفون" value={k.totalStaff || 0} icon={UserCog} />
        <StatCard label="مواعيد اليوم" value={k.appointmentsToday || 0} icon={CalendarClock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 text-xl font-black">المواعيد القادمة</h2>
          {upcoming.length === 0 ? (
            <p className="text-ink-500">لا توجد مواعيد قادمة حاليا.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div key={a._id} className="rounded-xl border border-ink-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-ink-900">{a.patientId?.fullName || '—'}</p>
                    <span className="text-sm text-ink-500">{formatDateTime(a.scheduledAt, 'ar')}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">
                    {a.serviceId?.name?.ar || a.serviceId?.name?.fr || a.serviceId?.name?.en || 'خدمة'}
                    {' · '}
                    {a.doctor || 'بدون طبيب'}
                    {' · '}
                    {a.branch?.name || '—'}
                    {' · '}
                    <span className="font-semibold">{statusLabel[a.status] || a.status}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, status: 'confirmed' })}
                      disabled={statusMutation.isPending || a.status === 'confirmed'}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      تأكيد
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, status: 'waiting' })}
                      disabled={statusMutation.isPending || a.status === 'waiting'}
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      تحويل للانتظار
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, status: 'cancelled', reason: 'Annule par administration' })}
                      disabled={statusMutation.isPending || a.status === 'cancelled'}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, status: 'completed' })}
                      disabled={statusMutation.isPending || a.status === 'completed'}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      إنهاء
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, status: 'no_show', reason: 'Patient absent' })}
                      disabled={statusMutation.isPending || a.status === 'no_show'}
                      className="rounded-lg bg-ink-700 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      لم يحضر
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 text-xl font-black">ملخص مالي (شهري)</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
              <span>المحصل</span>
              <strong>{k.monthlyRevenue || 0} DT</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-ink-100 px-3 py-2">
              <span>المفوتر</span>
              <strong>{k.monthlyInvoiced || 0} DT</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2">
              <span>المتبقي</span>
              <strong>{k.monthlyBalance || 0} DT</strong>
            </div>
            <div className="mt-2 text-ink-500">حالة الدور النشط: {k.activeQueueToday || 0}</div>
          </div>
        </div>
      </div>
    </section>
  );
}