import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowRight, User, CheckCircle2, AlertCircle,
  FileText, FlaskConical, Stethoscope, Calendar,
} from 'lucide-react';
import { doctorApi } from '@/lib/doctorApi';
import toast from 'react-hot-toast';

const Field = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
    />
  </div>
);

const CompletionItem = ({ done, label }) => (
  <li className={`flex items-center gap-2 text-xs ${done ? 'text-emerald-600' : 'text-amber-600'}`}>
    {done
      ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
      : <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />}
    {done ? `✓ ${label} مكتمل` : `استكمال ${label}`}
  </li>
);

export default function DoctorSessionPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [plan, setPlan] = useState('');
  const [decision, setDecision] = useState('');
  const [visitId, setVisitId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  // Load appointment details
  const { data, isLoading } = useQuery({
    queryKey: ['doctor-session', appointmentId],
    queryFn: () => doctorApi.getAppointmentDetail(appointmentId).then((r) => r.data.data),
  });

  // Start visit on load
  const startMutation = useMutation({
    mutationFn: () => doctorApi.startVisit(appointmentId),
    onSuccess: (r) => {
      const v = r.data.data.visit;
      setVisitId(v._id);
      if (v.complaint) setComplaint(v.complaint);
      if (v.diagnosis) setDiagnosis(v.diagnosis);
      if (v.plan) setPlan(v.plan);
      if (v.decision) setDecision(v.decision);
    },
  });

  useEffect(() => {
    if (data?.visit) {
      setVisitId(data.visit._id);
      setComplaint(data.visit.complaint || '');
      setDiagnosis(data.visit.diagnosis || '');
      setPlan(data.visit.plan || '');
      setDecision(data.visit.decision || '');
    } else if (data?.appointment && !data.visit) {
      startMutation.mutate();
    }
  }, [data]);

  // Auto-save with debounce
  const save = useCallback(async (fields) => {
    if (!visitId) return;
    setSaving(true);
    try {
      await doctorApi.saveVisitNotes({ visitId, ...fields });
      setSavedAt(new Date());
    } catch {}
    setSaving(false);
  }, [visitId]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (visitId) save({ complaint, diagnosis, plan, decision });
    }, 1500);
    return () => clearTimeout(t);
  }, [complaint, diagnosis, plan, decision, visitId]);

  const completeSession = async () => {
    if (visitId) await save({ complaint, diagnosis, plan, decision });
    await doctorApi.updateAppointmentStatus({ id: appointmentId, status: 'completed' });
    toast.success('تم إنهاء الجلسة بنجاح');
    navigate('/doctor');
  };

  const appt = data?.appointment;
  const patient = appt?.patientId;

  const completionItems = [
    { label: 'الشكوى', done: complaint.trim().length > 5 },
    { label: 'التشخيص', done: diagnosis.trim().length > 5 },
    { label: 'الخطة', done: plan.trim().length > 5 },
    { label: 'القرار', done: decision.trim().length > 3 },
  ];
  const completedCount = completionItems.filter((i) => i.done).length;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4" dir="rtl">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/doctor')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <ArrowRight className="h-4 w-4" />
          العودة
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Doctor Focus Mode</span>
          </div>
          <h1 className="text-lg font-black text-slate-800">
            جلسة كشف مركّزة: {patient?.fullName || '—'}
          </h1>
        </div>
      </div>

      {/* Session info bar */}
      {appt && (
        <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'الخدمة', value: appt.serviceId?.name?.ar || '—' },
            { label: 'التاريخ', value: new Date(appt.scheduledAt).toLocaleString('ar-TN') },
            { label: 'الهاتف', value: patient?.phone || '—' },
            { label: 'حالة الجلسة', value: appt.status === 'in_progress' ? 'جاري الكشف' : appt.status },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Patient quick info */}
          {patient && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-700">الملخص السريري السريع</span>
                <span className="text-xs text-slate-400 me-auto">الأفضل استكمال: الشكوى، التشخيص، الخطة، القرار قبل إنهاء الجلسة</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: 'الشكوى', value: complaint || 'غير مكتمل حتى الآن' },
                  { label: 'التشخيص', value: diagnosis || 'غير مكتمل حتى الآن' },
                  { label: 'القرار', value: decision || 'غير مكتمل حتى الآن' },
                ].map((f) => (
                  <div key={f.label} className={`rounded-lg p-2.5 ${f.value.includes('غير') ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    <p className="font-bold mb-0.5">{f.label}</p>
                    <p className="line-clamp-2">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form fields */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-slate-700">توثيق الجلسة</h2>
              {saving && <span className="text-xs text-blue-500 animate-pulse">جاري الحفظ...</span>}
              {!saving && savedAt && (
                <span className="text-xs text-emerald-600">
                  آخر حفظ: {savedAt.toLocaleTimeString('ar-TN')}
                </span>
              )}
            </div>
            <Field
              label="الشكوى"
              value={complaint}
              onChange={setComplaint}
              placeholder="ما الشكوى الرئيسية للمريض؟"
            />
            <Field
              label="التشخيص"
              value={diagnosis}
              onChange={setDiagnosis}
              placeholder="التشخيص الطبي..."
            />
            <Field
              label="الخطة العلاجية"
              value={plan}
              onChange={setPlan}
              placeholder="الخطة العلاجية المقترحة..."
            />
            <Field
              label="القرار النهائي"
              value={decision}
              onChange={setDecision}
              placeholder="القرار الطبي النهائي..."
              rows={2}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={completeSession}
              className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition-colors"
            >
              إنهاء الجلسة ✓
            </button>
            <button
              onClick={() => navigate(`/admin/patients`)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <User className="h-4 w-4" />
              ملف المريض
            </button>
            <button
              onClick={() => navigate('/doctor/appointments')}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Calendar className="h-4 w-4" />
              مواعيدي
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Completion checklist */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700">جاهزية الإجراء التالي</h3>
              <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${completedCount === 4 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {completedCount}/4
              </span>
            </div>
            {completedCount < 4 && (
              <p className="text-xs text-amber-600 mb-2">يُفضل استكمال التوثيق أولاً</p>
            )}
            <ul className="space-y-2">
              {completionItems.map((item) => (
                <CompletionItem key={item.label} {...item} />
              ))}
            </ul>
          </div>

          {/* Patient medical info */}
          {patient && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3">معلومات المريض</h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'الاسم', value: patient.fullName },
                  { label: 'الكود', value: patient.patientCode },
                  { label: 'العمر', value: patient.age ? `${patient.age} سنة` : '—' },
                  { label: 'فصيلة الدم', value: patient.bloodType || '—' },
                  { label: 'الحساسية', value: patient.allergies?.join('، ') || 'لا يوجد' },
                  { label: 'أمراض مزمنة', value: patient.chronicConditions?.join('، ') || 'لا يوجد' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-700 text-end max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </div>
              {patient.healthSummary && (
                <div className="mt-3 rounded-lg bg-blue-50 p-2.5 text-xs text-blue-700">
                  <p className="font-bold mb-0.5">الملخص الصحي:</p>
                  <p>{patient.healthSummary}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">التنقل السريع</h3>
            <div className="space-y-2">
              {[
                { icon: FileText, label: 'كتابة روشتة', color: 'text-blue-600 bg-blue-50' },
                { icon: FlaskConical, label: 'طلب تحاليل', color: 'text-violet-600 bg-violet-50' },
                { icon: Stethoscope, label: 'إضافة إجراء', color: 'text-emerald-600 bg-emerald-50' },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors hover:opacity-80 ${item.color}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
