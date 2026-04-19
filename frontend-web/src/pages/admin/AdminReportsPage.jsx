import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, Calendar, TrendingUp, Printer } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

const fmt = (n) => Number(n || 0).toFixed(2);

const todayStr = () => new Date().toISOString().slice(0, 10);
const firstDayStr = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};

export default function AdminReportsPage() {
  const [from, setFrom] = useState(firstDayStr());
  const [to, setTo] = useState(todayStr());
  const [doctorId, setDoctorId] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['commissions-report', from, to, doctorId],
    queryFn: () => adminApi.getCommissionsReport({ from, to, doctorId }).then((r) => r.data.data),
  });

  const rows = data?.rows || [];
  const totals = data?.totals || {};

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">التقارير المالية</h1>
          <p className="text-sm text-slate-500 mt-1">تقرير عمولات الأطباء حسب الفترة الزمنية.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          طباعة
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-1">إجمالي الإيراد الشهري</p>
          <p className="text-2xl font-black text-slate-800">{fmt(totals.totalBilled)} <span className="text-sm text-slate-500">DT</span></p>
          <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            إجمالي فواتير الفترة
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 mb-1">إجمالي العمولات</p>
          <p className="text-2xl font-black text-slate-800">{fmt(totals.totalCommission)} <span className="text-sm text-slate-500">DT</span></p>
          <div className="mt-2 flex items-center gap-1 text-blue-600 text-xs font-semibold">
            <BarChart2 className="h-3.5 w-3.5" />
            مستحقات الأطباء
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm col-span-2 md:col-span-1">
          <p className="text-xs font-semibold text-slate-500 mb-1">إجمالي المواعيد المنجزة</p>
          <p className="text-2xl font-black text-slate-800">{rows.reduce((s, r) => s + r.appointmentCount, 0)}</p>
          <div className="mt-2 flex items-center gap-1 text-violet-600 text-xs font-semibold">
            <Calendar className="h-3.5 w-3.5" />
            خلال الفترة المحددة
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">من تاريخ</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">إلى تاريخ</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-xl bg-[#1a4fa0] px-5 py-2 text-sm font-bold text-white hover:bg-[#163d80] transition-colors"
        >
          عرض التقرير
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3 bg-slate-50">
          <p className="font-bold text-slate-700 text-sm">
            الفترة: {from} — {to}
          </p>
        </div>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-slate-400 text-sm">جاري التحميل...</div>
        ) : rows.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-slate-400 text-sm">لا توجد بيانات للفترة المحددة</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-white">
              <tr>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">الطبيب</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">التخصص</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">عدد المواعيد</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">إجمالي الفواتير</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">أساس الحساب</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">العمولة المحسوبة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.doctorId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.doctorName}</td>
                  <td className="px-4 py-3 text-slate-500">{row.specialty}</td>
                  <td className="px-4 py-3 text-slate-700 font-bold">{row.appointmentCount}</td>
                  <td className="px-4 py-3 text-slate-700">{fmt(row.totalBilled)} DT</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {row.commissionType === 'percent' ? `${row.commissionValue}%` : `${row.commissionValue} DT/موعد`}
                  </td>
                  <td className="px-4 py-3 font-black text-emerald-700">{fmt(row.commissionEarned)} DT</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 font-black text-slate-700">الإجمالي</td>
                <td className="px-4 py-3 font-black text-slate-800">{fmt(totals.totalBilled)} DT</td>
                <td></td>
                <td className="px-4 py-3 font-black text-emerald-800">{fmt(totals.totalCommission)} DT</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
