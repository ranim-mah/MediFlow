import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/lib/doctorApi';
import { formatDateTime } from '@/lib/dates';

export default function DoctorAppointmentsPage() {
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['doctor', 'appointments', status],
    queryFn: () => doctorApi.listAppointments({ status }).then((r) => r.data.data),
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight text-[#19233f]">مواعيدي اليوم</h1>
        <select className="input max-w-[220px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">كل الحالات</option>
          <option value="pending">قيد المراجعة</option>
          <option value="confirmed">مؤكد</option>
          <option value="waiting">انتظار</option>
          <option value="in_progress">جاري</option>
          <option value="completed">منجز</option>
          <option value="no_show">لم يحضر</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      <div className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
        {isLoading ? (
          <p className="text-[#6d7ea6]">تحميل...</p>
        ) : data?.items?.length ? (
          <div className="space-y-2">
            {data.items.map((a) => (
              <div key={a._id} className="rounded-2xl border border-[#e7eef8] bg-[#fbfdff] p-3">
                <p className="font-bold text-[#19233f]">{a.patientId?.fullName || '—'}</p>
                <p className="text-xs text-[#6d7ea6]">{formatDateTime(a.scheduledAt, 'ar')} - {a.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#6d7ea6]">لا توجد مواعيد.</p>
        )}
      </div>
    </section>
  );
}
