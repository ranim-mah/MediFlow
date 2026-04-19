import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users, Stethoscope, PhoneCall, ShieldCheck, UserCog } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

const ROLE_LABELS = {
  admin: { label: 'مدير', color: 'bg-purple-100 text-purple-700' },
  doctor: { label: 'طبيب', color: 'bg-blue-100 text-blue-700' },
  reception: { label: 'استقبال', color: 'bg-green-100 text-green-700' },
  assistant: { label: 'مساعد', color: 'bg-yellow-100 text-yellow-700' },
  nurse: { label: 'ممرض/ة', color: 'bg-pink-100 text-pink-700' },
};

const ROLE_ICONS = {
  admin: ShieldCheck,
  doctor: Stethoscope,
  reception: PhoneCall,
  assistant: UserCog,
  nurse: Users,
};

export default function AdminStaffPage() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-staff', q, role, page],
    queryFn: () => adminApi.listStaff({ q, role, page, limit: 15 }).then((r) => r.data.data),
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-800">إدارة الموظفين</h1>
        <p className="text-sm text-slate-500">قائمة الأطباء والموظفين المسجلين في النظام.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد أو الهاتف..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pe-10 ps-4 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-blue-400"
        >
          <option value="">كل الأدوار</option>
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-slate-400 text-sm">جاري التحميل...</div>
        ) : items.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-slate-400 text-sm">لا توجد نتائج</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">#</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">الاسم</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">الدور</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">الهاتف</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">البريد</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">التخصص</th>
                <th className="px-4 py-3 text-end font-semibold text-slate-600">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                const roleInfo = ROLE_LABELS[item.role] || { label: item.role, color: 'bg-slate-100 text-slate-600' };
                const Icon = ROLE_ICONS[item.role] || Users;
                return (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{(page - 1) * 15 + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-slate-800">{item.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${roleInfo.color}`}>
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{item.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{item.email || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.doctorInfo?.specialty || (item.role !== 'doctor' ? '—' : '—')}
                      {item.doctorInfo && (
                        <span className="ms-2 text-xs text-slate-400">
                          عمولة {item.doctorInfo.commissionValue}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {item.isActive !== false ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>الإجمالي: {pagination.total} موظف</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              السابق
            </button>
            <span className="px-3 py-1.5 font-bold text-slate-700">{page} / {pagination.totalPages}</span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
