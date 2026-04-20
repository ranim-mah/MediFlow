import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, PlusCircle, CalendarDays, Filter, Clock3 } from 'lucide-react';
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

const toDayKey = (dateLike) => {
  const d = new Date(dateLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  const countsByDay = data?.countsByDay || [];

  const { calendarDays, byDay } = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    const padStart = first.getDay();
    const total = last.getDate();

    const mapped = {};
    events.forEach((e) => {
      const k = toDayKey(e.scheduledAt);
      mapped[k] = mapped[k] || [];
      mapped[k].push(e);
    });

    const arr = [];
    for (let i = 0; i < padStart; i += 1) arr.push(null);
    for (let d = 1; d <= total; d += 1) {
      const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      arr.push({ day: d, key, items: mapped[key] || [] });
    }
    while (arr.length % 7 !== 0) arr.push(null);
    return { calendarDays: arr, byDay: mapped };
  }, [month, events]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card md:p-5">
        <h1 className="text-3xl font-black text-ink-900">المواعيد</h1>
        <p className="mt-1 text-sm text-ink-500">بحث أسرع + إجراءات سريعة + تنظيم حسب اليوم لقراءة أوضح</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="rounded-xl bg-[#2f6bda] px-3 py-2 text-sm font-bold text-white">
            <span className="inline-flex items-center gap-1.5"><PlusCircle className="h-4 w-4" /> إضافة موعد جديد</span>
          </button>
          <button type="button" className="rounded-xl border border-ink-300 bg-white px-3 py-2 text-sm font-bold text-ink-700">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> التقويم</span>
          </button>
          <button type="button" className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
            <span className="inline-flex items-center gap-1.5"><Filter className="h-4 w-4" /> طلبات التعديل</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-4">
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
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-800">
            <p>مواعيد اليوم: <strong>{Object.values(byDay).find((x) => x?.length)?.length || 0}</strong></p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50 p-3 text-sm text-ink-700">
            <p>النتائج الحالية: <strong>{events.length}</strong></p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
        <div className="mb-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2">
            <p className="text-xs text-ink-500">النتائج الحالية</p>
            <p className="text-xl font-black">{events.length}</p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2">
            <p className="text-xs text-ink-500">مواعيد اليوم</p>
            <p className="text-xl font-black">{Object.values(countsByDay)[0] || 0}</p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2">
            <p className="text-xs text-ink-500">نشطة / انتظار</p>
            <p className="text-xl font-black">{events.filter((e) => ['pending', 'confirmed', 'waiting'].includes(e.status)).length}</p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2">
            <p className="text-xs text-ink-500">منتهية</p>
            <p className="text-xl font-black">{events.filter((e) => e.status === 'completed').length}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <>
            <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-ink-500">
              {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell, idx) => (
                <div key={idx} className="min-h-[112px] rounded-lg border border-ink-100 bg-ink-50 p-1.5">
                  {cell ? (
                    <>
                      <p className="mb-1 text-xs font-bold text-ink-700">{cell.day}</p>
                      <div className="space-y-1">
                        {cell.items.slice(0, 2).map((e) => (
                          <div key={e._id} className="rounded-md bg-white px-1.5 py-1 text-[10px] shadow-sm">
                            <p className="line-clamp-1 font-bold text-ink-800">{e.patient?.fullName || '—'}</p>
                            <p className="line-clamp-1 text-ink-500">{e.service?.name?.ar || e.service?.name?.fr || e.service?.name?.en || 'خدمة'}</p>
                          </div>
                        ))}
                        {cell.items.length > 2 ? (
                          <p className="text-[10px] font-bold text-brand-700">+{cell.items.length - 2} أكثر</p>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
        <h2 className="mb-3 text-lg font-black">تفاصيل المواعيد</h2>
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-ink-500">لا توجد مواعيد في النطاق الحالي.</p>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 40).map((e) => (
              <div key={e._id} className="rounded-xl border border-ink-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-ink-900">{e.patient?.fullName || '—'}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-ink-500"><Clock3 className="h-3.5 w-3.5" />{formatDateTime(e.scheduledAt, 'ar')}</span>
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
                  <button
                    onClick={() => statusMutation.mutate({ id: e._id, status: 'completed' })}
                    disabled={statusMutation.isPending || e.status === 'completed'}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    إنهاء
                  </button>
                  <button
                    onClick={() => statusMutation.mutate({ id: e._id, status: 'no_show', reason: 'Patient absent' })}
                    disabled={statusMutation.isPending || e.status === 'no_show'}
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
    </section>
  );
}
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, PlusCircle, CalendarDays, Filter, Clock3 } from 'lucide-react';
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

const toDayKey = (dateLike) => {
  const d = new Date(dateLike);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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

  const { calendarDays, byDay } = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0);
    const padStart = first.getDay();
    const total = last.getDate();

    const mapped = {};
    events.forEach((e) => {
      const k = toDayKey(e.scheduledAt);
      mapped[k] = mapped[k] || [];
      mapped[k].push(e);
    });

    const arr = [];
    for (let i = 0; i < padStart; i += 1) arr.push(null);
    for (let d = 1; d <= total; d += 1) {
      const key = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      arr.push({ day: d, key, items: mapped[key] || [] });
    }
    while (arr.length % 7 !== 0) arr.push(null);
    return { calendarDays: arr, byDay: mapped };
  }, [month, events]);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card md:p-5">
        <h1 className="text-3xl font-black text-ink-900">المواعيد</h1>
        <p className="mt-1 text-sm text-ink-500">بحث أسرع + إجراءات سريعة + تنظيم حسب اليوم لقراءة أوضح</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="rounded-xl bg-[#2f6bda] px-3 py-2 text-sm font-bold text-white">
            <span className="inline-flex items-center gap-1.5"><PlusCircle className="h-4 w-4" /> إضافة موعد جديد</span>
          </button>
          <button type="button" className="rounded-xl border border-ink-300 bg-white px-3 py-2 text-sm font-bold text-ink-700">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> التقويم</span>
          </button>
          <button type="button" className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
            <span className="inline-flex items-center gap-1.5"><Filter className="h-4 w-4" /> طلبات التعديل</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-4">
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
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm text-brand-800">
            <p>مواعيد اليوم: <strong>{Object.values(byDay).find((x) => x?.length)?.length || 0}</strong></p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50 p-3 text-sm text-ink-700">
            <p>النتائج الحالية: <strong>{events.length}</strong></p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
        <div className="mb-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2">
            <p className="text-xs text-ink-500">النتائج الحالية</p>
            <p className="text-xl font-black">{events.length}</p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2">
            <p className="text-xs text-ink-500">مواعيد اليوم</p>
            <p className="text-xl font-black">{Object.values(countsByDay)[0] || 0}</p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2">
            <p className="text-xs text-ink-500">نشطة / انتظار</p>
            <p className="text-xl font-black">{events.filter((e) => ['pending', 'confirmed', 'waiting'].includes(e.status)).length}</p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-2">
            <p className="text-xs text-ink-500">منتهية</p>
            <p className="text-xl font-black">{events.filter((e) => e.status === 'completed').length}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <>
            <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-ink-500">
              {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell, idx) => (
                <div key={idx} className="min-h-[112px] rounded-lg border border-ink-100 bg-ink-50 p-1.5">
                  {cell ? (
                    <>
                      <p className="mb-1 text-xs font-bold text-ink-700">{cell.day}</p>
                      <div className="space-y-1">
                        {cell.items.slice(0, 2).map((e) => (
                          <div key={e._id} className="rounded-md bg-white px-1.5 py-1 text-[10px] shadow-sm">
                            <p className="line-clamp-1 font-bold text-ink-800">{e.patient?.fullName || '—'}</p>
                            <p className="line-clamp-1 text-ink-500">{e.service?.name?.ar || e.service?.name?.fr || e.service?.name?.en || 'خدمة'}</p>
                          </div>
                        ))}
                        {cell.items.length > 2 ? (
                          <p className="text-[10px] font-bold text-brand-700">+{cell.items.length - 2} أكثر</p>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
        <h2 className="mb-3 text-lg font-black">تفاصيل المواعيد</h2>
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-ink-500">لا توجد مواعيد في النطاق الحالي.</p>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 40).map((e) => (
              <div key={e._id} className="rounded-xl border border-ink-100 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-ink-900">{e.patient?.fullName || '—'}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-ink-500"><Clock3 className="h-3.5 w-3.5" />{formatDateTime(e.scheduledAt, 'ar')}</span>
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
                  <button
                    onClick={() => statusMutation.mutate({ id: e._id, status: 'completed' })}
                    disabled={statusMutation.isPending || e.status === 'completed'}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    إنهاء
                  </button>
                  <button
                    onClick={() => statusMutation.mutate({ id: e._id, status: 'no_show', reason: 'Patient absent' })}
                    disabled={statusMutation.isPending || e.status === 'no_show'}
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
    </section>
  );
}