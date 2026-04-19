import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { formatDate, formatDateTime } from '@/lib/dates';

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
                <tr
                  key={p._id}
                  className="cursor-pointer border-b border-ink-50 hover:bg-ink-50/60"
                  onClick={() => setSelectedPatientId(p._id)}
                >
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

      {selectedPatientId && (
        <div className="fixed inset-0 z-50 bg-ink-950/40 p-4 backdrop-blur-sm md:p-8">
          <div className="mx-auto h-full w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl md:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-ink-900">تفاصيل ملف المريض</h2>
                <p className="mt-1 text-sm text-ink-500">عرض الموعدات والزيارات والوصفات والتحاليل</p>
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