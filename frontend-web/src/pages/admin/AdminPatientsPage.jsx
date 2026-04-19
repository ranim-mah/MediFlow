import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { formatDate } from '@/lib/dates';

export default function AdminPatientsPage() {
  const [q, setQ] = useState('');
  const [risk, setRisk] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'patients', q, risk],
    queryFn: () => adminApi.listPatients({ q, risk, page: 1, limit: 50 }).then((r) => r.data),
  });

  const items = data?.items || [];
  const summary = data?.summary || { highRiskCount: 0, chronicCount: 0 };

  const rows = useMemo(() => items, [items]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-ink-900">إدارة المرضى</h1>
        <p className="mt-1 text-ink-500">بحث ومتابعة ملفات المرضى داخل العيادة</p>
      </div>

      <div className="card">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="relative md:col-span-2">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              className="input ps-9"
              placeholder="ابحث بالاسم أو الهاتف أو كود المريض"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <select className="input" value={risk} onChange={(e) => setRisk(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="high">عالي الخطورة</option>
            <option value="chronic">مزمن</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm text-ink-600">
          <span className="badge bg-rose-50 text-rose-700">عالي الخطورة: {summary.highRiskCount || 0}</span>
          <span className="badge bg-amber-50 text-amber-700">مزمن: {summary.chronicCount || 0}</span>
          <span className="badge bg-brand-50 text-brand-700">النتائج: {rows.length}</span>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-ink-500">لا توجد نتائج مطابقة.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-ink-500">
                <th className="px-3 py-2 text-start">الكود</th>
                <th className="px-3 py-2 text-start">الاسم</th>
                <th className="px-3 py-2 text-start">الهاتف</th>
                <th className="px-3 py-2 text-start">الفرع</th>
                <th className="px-3 py-2 text-start">آخر زيارة</th>
                <th className="px-3 py-2 text-start">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p._id} className="border-b border-ink-50">
                  <td className="px-3 py-2 font-semibold">{p.patientCode}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-ink-900">{p.fullName}</div>
                    <div className="text-xs text-ink-500">{p.email || '—'}</div>
                  </td>
                  <td className="px-3 py-2" dir="ltr">{p.phone}</td>
                  <td className="px-3 py-2">{p.branchId?.name || '—'}</td>
                  <td className="px-3 py-2">{formatDate(p.lastVisitAt, 'ar')}</td>
                  <td className="px-3 py-2 font-bold">{p.outstandingBalance || 0} DT</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}