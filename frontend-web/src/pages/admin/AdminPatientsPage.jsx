
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, UserPlus, Search, Filter, FileText, FolderOpen, ListOrdered,
  Receipt, Calendar, Pencil, Trash2, AlertTriangle, BookOpen, HelpCircle,
  Info, Loader2, Phone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/adminApi';

export default function AdminPatientsPage() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();

  const [filters, setFilters] = useState({
    q: '',
    isHighRisk: false,
    isChronic: false,
    withBalance: false,
  });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'patients', filters, page],
    queryFn: () =>
      adminApi
        .listPatients({
          ...(filters.q && { q: filters.q }),
          ...(filters.isHighRisk && { isHighRisk: true }),
          ...(filters.isChronic && { isChronic: true }),
          ...(filters.withBalance && { withBalance: true }),
          page,
          limit: 20,
        })
        .then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deletePatient(id),
    onSuccess: () => {
      toast.success(t('admin.patients.newForm.deleted'));
      qc.invalidateQueries({ queryKey: ['admin', 'patients'] });
    },
    onError: (err) => toast.error(err.message || t('common.error')),
  });

  const onDelete = (id) => {
    if (confirm(t('admin.patients.newForm.deleteConfirm'))) deleteMut.mutate(id);
  };

  const items = data?.items || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  // KPIs computed on loaded page + total
  const stats = {
    total,
    newThisMonth: items.filter((p) => new Date(p.createdAt) > new Date(Date.now() - 30 * 864e5)).length,
    highRisk: items.filter((p) => p.isHighRisk || p.isChronic).length,
    withBalance: items.filter((p) => p.outstandingBalance > 0).length,
  };

  return (
    <div className="space-y-5">
      {/* About + help */}
      <section className="rounded-2xl bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-1 inline-flex items-center gap-2 text-sm font-bold text-ink-500">
              <Info className="h-4 w-4" /> {t('admin.aboutPage')}
            </div>
            <p className="text-sm text-ink-600">{t('admin.patients.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline gap-1 text-xs"><BookOpen className="h-3.5 w-3.5" /> {t('admin.quickGuide')}</button>
            <button className="btn-primary gap-1 text-xs"><HelpCircle className="h-3.5 w-3.5" /> {t('admin.helpCenter')}</button>
          </div>
        </div>
      </section>

      {/* Title + KPIs */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black md:text-3xl flex items-center gap-2">
            <Users className="h-7 w-7 text-brand-700" />
            {t('admin.patients.title')}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/patients/new" className="btn-primary gap-2">
            <UserPlus className="h-4 w-4" /> {t('admin.patients.newPatient')}
          </Link>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="card border-l-4 border-brand-500">
          <p className="text-sm text-ink-500">{t('admin.patients.total')}</p>
          <p className="mt-1 text-2xl font-black">{stats.total}</p>
        </div>
        <div className="card border-l-4 border-emerald-500">
          <p className="text-sm text-ink-500">{t('admin.patients.newThisMonth')}</p>
          <p className="mt-1 text-2xl font-black">{stats.newThisMonth}</p>
        </div>
        <div className="card border-l-4 border-amber-500">
          <p className="text-sm text-ink-500">{t('admin.patients.highRiskCount')}</p>
          <p className="mt-1 text-2xl font-black">{stats.highRisk}</p>
        </div>
        <div className="card border-l-4 border-rose-500">
          <p className="text-sm text-ink-500">{t('admin.patients.withBalance')}</p>
          <p className="mt-1 text-2xl font-black">{stats.withBalance}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 start-3" />
            <input
              value={filters.q}
              onChange={(e) => { setFilters({ ...filters, q: e.target.value }); setPage(1); }}
              placeholder={t('admin.patients.searchPlaceholder')}
              className="input ps-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip
              label={t('admin.patients.flags.highRisk')}
              active={filters.isHighRisk}
              onClick={() => { setFilters({ ...filters, isHighRisk: !filters.isHighRisk }); setPage(1); }}
            />
            <FilterChip
              label={t('admin.patients.flags.chronic')}
              active={filters.isChronic}
              onClick={() => { setFilters({ ...filters, isChronic: !filters.isChronic }); setPage(1); }}
            />
            <FilterChip
              label={t('admin.patients.withBalance')}
              active={filters.withBalance}
              onClick={() => { setFilters({ ...filters, withBalance: !filters.withBalance }); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto p-0">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-ink-500">{t('admin.patients.noResults')}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs font-bold uppercase tracking-wider text-ink-500">
              <tr>
                <th className="px-4 py-3 text-start">{t('admin.patients.colCode')}</th>
                <th className="px-4 py-3 text-start">{t('admin.patients.colName')}</th>
                <th className="px-4 py-3 text-start">{t('admin.patients.colContact')}</th>
                <th className="px-4 py-3 text-start">{t('admin.patients.colLastVisit')}</th>
                <th className="px-4 py-3 text-start">{t('admin.patients.colBalance')}</th>
                <th className="px-4 py-3 text-start">{t('admin.patients.colFlags')}</th>
                <th className="px-4 py-3 text-start">{t('admin.patients.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {items.map((p) => (
                <tr key={p._id} className="hover:bg-ink-50">
                  <td className="px-4 py-3 font-mono text-xs text-ink-500">{p.patientCode}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-black">
                        {p.fullName?.slice(0, 1)}
                      </div>
                      <div>
                        <p className="font-bold text-ink-900">{p.fullName}</p>
                        <p className="text-xs text-ink-500">{t('admin.patients.age')}: {p.age || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-ink-600" dir="ltr">
                      <Phone className="h-3 w-3" /> {p.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600" dir="ltr">
                    {p.lastVisitAt ? new Date(p.lastVisitAt).toISOString().slice(0, 10) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.outstandingBalance > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {(p.outstandingBalance || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.isHighRisk && <span className="badge bg-rose-100 text-rose-800">{t('admin.patients.flags.highRisk')}</span>}
                      {p.isChronic && <span className="badge bg-amber-100 text-amber-800">{t('admin.patients.flags.chronic')}</span>}
                      {p.allergies?.length > 0 && <span className="badge bg-violet-100 text-violet-800">{t('admin.patients.flags.allergy')}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <Link to={`/admin/patients/${p._id}`} className="btn gap-1 bg-brand-600 text-white px-2 py-1 text-xs hover:bg-brand-700">
                        <FolderOpen className="h-3 w-3" />
                        {t('admin.patients.actions.file')}
                      </Link>
                      <Link to={`/admin/patients/${p._id}/medical`} className="btn gap-1 border border-brand-300 text-brand-700 px-2 py-1 text-xs hover:bg-brand-50">
                        <FileText className="h-3 w-3" />
                        {t('admin.patients.actions.medicalFile')}
                      </Link>
                      <button className="btn gap-1 border border-ink-200 px-2 py-1 text-xs hover:bg-ink-50">
                        <ListOrdered className="h-3 w-3" />
                        {t('admin.patients.actions.record')}
                      </button>
                      <button className="btn gap-1 bg-emerald-600 text-white px-2 py-1 text-xs hover:bg-emerald-700">
                        <Receipt className="h-3 w-3" />
                        {t('admin.patients.actions.invoice')}
                      </button>
                      <button className="btn gap-1 bg-teal-600 text-white px-2 py-1 text-xs hover:bg-teal-700">
                        <Calendar className="h-3 w-3" />
                        {t('admin.patients.actions.appointment')}
                      </button>
                      <button
                        onClick={() => onDelete(p._id)}
                        className="btn gap-1 border border-rose-200 text-rose-700 px-2 py-1 text-xs hover:bg-rose-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        {t('admin.patients.actions.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="btn-outline disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="text-sm font-bold">{page} / {pages}</span>
          <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="btn-outline disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
        active ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:bg-ink-50'
      }`}
    >
      <Filter className="h-3 w-3" /> {label}
    </button>
  );
}
export default function AdminPatientsPage() {
  const [q, setQ] = useState('');
  const [risk, setRisk] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'patients', q, risk],
    queryFn: () => adminApi.listPatients({ q, risk, page: 1, limit: 50 }).then((r) => r.data),
  });

  const { data: detailsData, isLoading: loadingDetails } = useQuery({
    queryKey: ['admin', 'patient-details', selectedPatientId],
    queryFn: () => adminApi.getPatientDetails(selectedPatientId).then((r) => r.data),
    enabled: Boolean(selectedPatientId),
  });

  const items = data?.items || [];
  const summary = data?.summary || { highRiskCount: 0, chronicCount: 0 };

  const rows = useMemo(() => items, [items]);
  const totalBalance = rows.reduce((acc, p) => acc + Number(p.outstandingBalance || 0), 0);

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card md:p-5">
        <h1 className="text-3xl font-black text-ink-900">المرضى</h1>
        <p className="mt-1 text-sm text-ink-500">بحث + تصفية + إجراءات سريعة على ملفات المرضى</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-ink-100 bg-ink-50 px-3 py-3">
            <p className="text-xs text-ink-500">إجمالي المرضى</p>
            <p className="mt-1 text-2xl font-black">{rows.length}</p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-rose-50 px-3 py-3">
            <p className="inline-flex items-center gap-1 text-xs text-rose-700"><ShieldAlert className="h-3.5 w-3.5" /> عالي الخطورة</p>
            <p className="mt-1 text-2xl font-black text-rose-700">{summary.highRiskCount || 0}</p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-amber-50 px-3 py-3">
            <p className="text-xs text-amber-700">حالات مزمنة</p>
            <p className="mt-1 text-2xl font-black text-amber-700">{summary.chronicCount || 0}</p>
          </div>
          <div className="rounded-xl border border-ink-100 bg-brand-50 px-3 py-3">
            <p className="inline-flex items-center gap-1 text-xs text-brand-700"><Wallet className="h-3.5 w-3.5" /> إجمالي الرصيد</p>
            <p className="mt-1 text-2xl font-black text-brand-700">{totalBalance.toFixed(2)} DT</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
        <div className="grid gap-3 md:grid-cols-4">
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

          <button type="button" className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> آخر الزيارات</span>
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm text-ink-600">
          <span className="badge bg-rose-50 text-rose-700">عالي الخطورة: {summary.highRiskCount || 0}</span>
          <span className="badge bg-amber-50 text-amber-700">مزمن: {summary.chronicCount || 0}</span>
          <span className="badge bg-brand-50 text-brand-700">النتائج: {rows.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-card">
        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : rows.length === 0 ? (
          <p className="p-5 text-ink-500">لا توجد نتائج مطابقة.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-[#f5f8ff]">
              <tr className="border-b border-ink-100 text-ink-500">
                <th className="px-3 py-3 text-start">#</th>
                <th className="px-3 py-3 text-start">الكود</th>
                <th className="px-3 py-2 text-start">الاسم</th>
                <th className="px-3 py-2 text-start">الهاتف</th>
                <th className="px-3 py-2 text-start">آخر زيارة</th>
                <th className="px-3 py-2 text-start">المؤشرات</th>
                <th className="px-3 py-2 text-start">آخر زيارة</th>
                <th className="px-3 py-2 text-start">الرصيد</th>
                <th className="px-3 py-2 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, idx) => (
                <tr
                  key={p._id}
                  className="cursor-pointer border-b border-ink-50 hover:bg-ink-50/60"
                  onClick={() => setSelectedPatientId(p._id)}
                >
                  <td className="px-3 py-2 text-ink-500">{idx + 1}</td>
                  <td className="px-3 py-2 font-semibold">{p.patientCode}</td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-ink-900">{p.fullName}</div>
                    <div className="text-xs text-ink-500">{p.email || '—'}</div>
                  </td>
                  <td className="px-3 py-2" dir="ltr">{p.phone}</td>
                  <td className="px-3 py-2">{formatDate(p.lastVisitAt, 'ar')}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {p.isHighRisk ? <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">حرج</span> : null}
                      {p.isChronic ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">مزمن</span> : null}
                      {!p.isHighRisk && !p.isChronic ? <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-bold text-ink-600">مستقر</span> : null}
                    </div>
                  </td>
                  <td className="px-3 py-2">{formatDate(p.lastVisitAt, 'ar')}</td>
                  <td className="px-3 py-2 font-bold">{p.outstandingBalance || 0} DT</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <button type="button" className="rounded-full border border-brand-300 px-2 py-0.5 text-[11px] font-bold text-brand-700">الملف</button>
                      <button type="button" className="rounded-full border border-ink-300 px-2 py-0.5 text-[11px] font-bold text-ink-700">تعديل</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedPatientId && (
        <div className="fixed inset-0 z-50 bg-ink-950/40 p-4 backdrop-blur-sm md:p-8">
          <div className="mx-auto h-full w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl md:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-ink-900">تفاصيل ملف المريض</h2>
                <p className="mt-1 text-sm text-ink-500">عرض المواعيد والزيارات والوصفات والتحاليل</p>
              </div>
              <button className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm" onClick={() => setSelectedPatientId(null)}>
                إغلاق
              </button>
            </div>

            {loadingDetails ? (
              <div className="flex min-h-[260px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
              </div>
            ) : (
              <>
                <div className="grid gap-3 rounded-xl bg-ink-50 p-4 text-sm md:grid-cols-2">
                  <div>
                    <span className="text-ink-500">الاسم:</span>{' '}
                    <strong>{detailsData?.patient?.fullName || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500">الكود:</span>{' '}
                    <strong>{detailsData?.patient?.patientCode || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500">الهاتف:</span>{' '}
                    <strong dir="ltr">{detailsData?.patient?.phone || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500">الفصيلة:</span>{' '}
                    <strong>{detailsData?.patient?.bloodType || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500">الحساسية:</span>{' '}
                    <strong>{detailsData?.patient?.allergies?.join('، ') || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-ink-500">الأمراض المزمنة:</span>{' '}
                    <strong>{detailsData?.patient?.chronicConditions?.join('، ') || '—'}</strong>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-ink-100 p-4">
                    <h3 className="mb-3 text-lg font-black">آخر المواعيد</h3>
                    <div className="space-y-2 text-sm">
                      {(detailsData?.files?.appointments || []).slice(0, 8).map((a) => (
                        <div key={a._id} className="rounded-lg bg-ink-50 px-3 py-2">
                          <div className="font-semibold">{formatDateTime(a.scheduledAt, 'ar')}</div>
                          <div className="text-ink-600">{a.serviceId?.name?.ar || a.serviceId?.name?.fr || a.serviceId?.name?.en || 'خدمة'}</div>
                        </div>
                      ))}
                      {(detailsData?.files?.appointments || []).length === 0 && (
                        <p className="text-ink-500">لا توجد مواعيد مسجلة.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-ink-100 p-4">
                    <h3 className="mb-3 text-lg font-black">آخر الزيارات</h3>
                    <div className="space-y-2 text-sm">
                      {(detailsData?.files?.visits || []).slice(0, 8).map((v) => (
                        <div key={v._id} className="rounded-lg bg-ink-50 px-3 py-2">
                          <div className="font-semibold">{formatDateTime(v.visitDate || v.createdAt, 'ar')}</div>
                          <div className="text-ink-600">{v.chiefComplaint || 'بدون شكوى مسجلة'}</div>
                        </div>
                      ))}
                      {(detailsData?.files?.visits || []).length === 0 && (
                        <p className="text-ink-500">لا توجد زيارات مسجلة.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-ink-100 p-4">
                    <h3 className="mb-3 text-lg font-black">الوصفات</h3>
                    <div className="space-y-2 text-sm">
                      {(detailsData?.files?.prescriptions || []).slice(0, 6).map((p) => (
                        <div key={p._id} className="rounded-lg bg-ink-50 px-3 py-2">
                          <div className="font-semibold">{formatDateTime(p.issuedAt || p.createdAt, 'ar')}</div>
                          <div className="text-ink-600">{p.notes || 'وصفة طبية'}</div>
                        </div>
                      ))}
                      {(detailsData?.files?.prescriptions || []).length === 0 && (
                        <p className="text-ink-500">لا توجد وصفات.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-ink-100 p-4">
                    <h3 className="mb-3 text-lg font-black">التحاليل</h3>
                    <div className="space-y-2 text-sm">
                      {(detailsData?.files?.labs || []).slice(0, 6).map((l) => (
                        <div key={l._id} className="rounded-lg bg-ink-50 px-3 py-2">
                          <div className="font-semibold">{formatDateTime(l.requestedAt || l.createdAt, 'ar')}</div>
                          <div className="text-ink-600">{l.testName || l.panelName || 'تحليل مخبري'}</div>
                        </div>
                      ))}
                      {(detailsData?.files?.labs || []).length === 0 && (
                        <p className="text-ink-500">لا توجد تحاليل.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-ink-100 p-4">
                    <h3 className="mb-3 text-lg font-black">الأشعة</h3>
                    <div className="space-y-2 text-sm">
                      {(detailsData?.files?.radiology || []).slice(0, 6).map((r) => (
                        <div key={r._id} className="rounded-lg bg-ink-50 px-3 py-2">
                          <div className="font-semibold">{formatDateTime(r.requestedAt || r.createdAt, 'ar')}</div>
                          <div className="text-ink-600">{r.testName || r.type || 'فحص أشعة'}</div>
                        </div>
                      ))}
                      {(detailsData?.files?.radiology || []).length === 0 && (
                        <p className="text-ink-500">لا توجد فحوصات أشعة.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}