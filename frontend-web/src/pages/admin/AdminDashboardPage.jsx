import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  UserCog,
  UserRoundCheck,
  CalendarClock,
  Loader2,
  Search,
  Wallet,
  FileBarChart2,
  PlusCircle,
  Receipt,
  UserPlus,
  CalendarPlus,
  Star,
  Activity,
} from 'lucide-react';
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
    <div className="rounded-[24px] border border-[#e7eef8] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#6d7ea6]">{label}</span>
        <span className="rounded-xl bg-[#edf4ff] p-2">
          <Icon className="h-4 w-4 text-brand-700" />
        </span>
      </div>
      <p className="text-3xl font-black leading-none tracking-tight text-[#19233f]">{value}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 rounded-[22px] border border-[#e7eef8] bg-white px-4 py-5 text-sm font-bold text-[#19233f] transition-colors hover:border-brand-300 hover:bg-brand-50"
    >
      <Icon className="h-4 w-4 text-brand-700" />
      {label}
    </button>
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
    <section className="space-y-5">
      <div className="rounded-[28px] border border-[#e7eef8] bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.06)] md:p-5">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs font-bold text-[#6d7ea6]">صباح الخير</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#19233f]">أهلا بك أستاذ Mediflow</h1>
            <p className="mt-1 text-sm text-[#6d7ea6]">نظرة سريعة على التشغيل اليومي، الأداء والتحصيل داخل العيادة</p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#e7eef8] bg-[#fbfdff] px-3 py-2">
                <p className="text-xs text-[#6d7ea6]">مرضي جدد اليوم</p>
                <p className="text-xl font-black tracking-tight text-[#19233f]">{k.totalPatients || 0}</p>
              </div>
              <div className="rounded-2xl border border-[#e7eef8] bg-[#fbfdff] px-3 py-2">
                <p className="text-xs text-[#6d7ea6]">فواتير</p>
                <p className="text-xl font-black tracking-tight text-[#19233f]">{k.monthlyInvoiced || 0}</p>
              </div>
              <div className="rounded-2xl border border-[#e7eef8] bg-[#fbfdff] px-3 py-2">
                <p className="text-xs text-[#6d7ea6]">صافي اليوم</p>
                <p className="text-xl font-black tracking-tight text-[#19233f]">{k.monthlyRevenue || 0}.00</p>
              </div>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#e7eef8] bg-[#fbfdff] p-4">
            <p className="text-sm font-bold text-[#19233f]">بحث سريع داخل النظام</p>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#e7eef8] bg-white px-3 py-2">
              <Search className="h-4 w-4 text-[#a0afcb]" />
              <input className="w-full bg-transparent text-sm outline-none" placeholder="مريض، موبايل، فاتورة، موعد..." />
            </div>
            <p className="mt-2 text-xs text-[#6d7ea6]">ابحث عن أي رقم ملف أو اسم أو موبايل للوصول السريع.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" className="rounded-xl bg-[#2d6df0] px-3 py-2 text-xs font-bold text-white">المواعيد</button>
              <button type="button" className="rounded-xl border border-[#e7eef8] bg-white px-3 py-2 text-xs font-bold text-[#19233f]">المرضى</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي المرضى" value={k.totalPatients || 0} icon={Users} />
        <StatCard label="الأطباء" value={k.totalDoctors || 0} icon={UserRoundCheck} />
        <StatCard label="الموظفون" value={k.totalStaff || 0} icon={UserCog} />
        <StatCard label="مواعيد اليوم" value={k.appointmentsToday || 0} icon={CalendarClock} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <QuickAction icon={Wallet} label="المدفوعات" />
        <QuickAction icon={FileBarChart2} label="التقارير" />
        <QuickAction icon={PlusCircle} label="إضافة عملية" />
        <QuickAction icon={Receipt} label="فاتورة جديدة" />
        <QuickAction icon={UserPlus} label="مريض جديد" />
        <QuickAction icon={CalendarPlus} label="إضافة موعد" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[28px] border border-[#e7eef8] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-xl font-black tracking-tight text-[#19233f]">المواعيد القادمة</h2>
            <button type="button" className="rounded-xl border border-[#e7eef8] px-2.5 py-1 text-xs font-bold text-[#2d6df0]">عرض الكل</button>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-[#6d7ea6]">لا توجد مواعيد قادمة حاليا.</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div key={a._id} className="rounded-2xl border border-[#e7eef8] bg-[#fbfdff] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-[#19233f]">{a.patientId?.fullName || '—'}</p>
                    <span className="text-sm text-[#6d7ea6]">{formatDateTime(a.scheduledAt, 'ar')}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#627395]">
                    {a.serviceId?.name?.ar || a.serviceId?.name?.fr || a.serviceId?.name?.en || 'خدمة'}
                    {' · '}
                    {a.doctor || 'بدون طبيب'}
                    {' · '}
                    {a.branchId?.name || '—'}
                    {' · '}
                    <span className="font-semibold">{statusLabel[a.status] || a.status}</span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, status: 'confirmed' })}
                      disabled={statusMutation.isPending || a.status === 'confirmed'}
                      className="rounded-xl bg-[#2d6df0] px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      تأكيد
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, status: 'waiting' })}
                      disabled={statusMutation.isPending || a.status === 'waiting'}
                      className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      تحويل للانتظار
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, status: 'cancelled', reason: 'Annule par administration' })}
                      disabled={statusMutation.isPending || a.status === 'cancelled'}
                      className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, status: 'completed' })}
                      disabled={statusMutation.isPending || a.status === 'completed'}
                      className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      إنهاء
                    </button>
                    <button
                      onClick={() => statusMutation.mutate({ id: a._id, status: 'no_show', reason: 'Patient absent' })}
                      disabled={statusMutation.isPending || a.status === 'no_show'}
                      className="rounded-xl bg-[#24324f] px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      لم يحضر
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-[#e7eef8] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <h2 className="mb-4 text-xl font-black tracking-tight text-[#19233f]">ملخص مالي (شهري)</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-[#eef4ff] px-3 py-2">
                <span>المحصل</span>
                <strong>{k.monthlyRevenue || 0} DT</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#f3f6fb] px-3 py-2">
                <span>المفوتر</span>
                <strong>{k.monthlyInvoiced || 0} DT</strong>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-[#fff6e9] px-3 py-2">
                <span>المتبقي</span>
                <strong>{k.monthlyBalance || 0} DT</strong>
              </div>
              <div className="mt-2 text-[#6d7ea6]">حالة الدور النشط: {k.activeQueueToday || 0}</div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e7eef8] bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-700" />
              <h2 className="text-lg font-black tracking-tight text-[#19233f]">مؤشر الأداء الشهري</h2>
            </div>
            <div className="space-y-2 text-xs">
              <div className="h-2.5 rounded-full bg-ink-100">
                <div className="h-2.5 w-[78%] rounded-full bg-[#49a5ff]" />
              </div>
              <div className="h-2.5 rounded-full bg-ink-100">
                <div className="h-2.5 w-[42%] rounded-full bg-[#f5b04c]" />
              </div>
              <div className="h-2.5 rounded-full bg-ink-100">
                <div className="h-2.5 w-[22%] rounded-full bg-[#fc7d7d]" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#6d7ea6]">
              <Star className="h-3.5 w-3.5" />
              عرض مبسط محاكي للشكل المرجعي.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}