import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/adminApi';

export function PrescriptionModal({ visitId, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [meds, setMeds] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (i, field, value) => {
    const next = [...meds];
    next[i] = { ...next[i], [field]: value };
    setMeds(next);
  };
  const addRow = () => setMeds([...meds, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const removeRow = (i) => setMeds(meds.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    const cleaned = meds.filter((m) => m.name.trim());
    if (!cleaned.length) return toast.error(t('common.error'));
    setSaving(true);
    try {
      await adminApi.addPrescription(visitId, { medications: cleaned, notes });
      toast.success(t('focusMode.rxCreated'));
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={t('focusMode.writePrescription')} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          {meds.map((m, i) => (
            <div key={i} className="rounded-xl border border-ink-200 bg-ink-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-ink-700">{t('focusMode.medications')} #{i + 1}</span>
                {meds.length > 1 && (
                  <button type="button" onClick={() => removeRow(i)} className="text-rose-600 hover:text-rose-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <input value={m.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder={t('focusMode.medName')} className="input" required />
                <input value={m.dosage} onChange={(e) => update(i, 'dosage', e.target.value)} placeholder={t('focusMode.dosage')} className="input" />
                <input value={m.frequency} onChange={(e) => update(i, 'frequency', e.target.value)} placeholder={t('focusMode.frequency')} className="input" />
                <input value={m.duration} onChange={(e) => update(i, 'duration', e.target.value)} placeholder={t('focusMode.duration')} className="input" />
                <input value={m.instructions} onChange={(e) => update(i, 'instructions', e.target.value)} placeholder={t('focusMode.instructions')} className="input md:col-span-2" />
              </div>
            </div>
          ))}
          <button type="button" onClick={addRow} className="btn-outline w-full gap-1 text-sm">
            <Plus className="h-4 w-4" /> {t('focusMode.addMedication')}
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-[70px]" />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-outline">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('focusMode.saveRx')}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function LabTestModal({ visitId, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [tests, setTests] = useState([{ name: '' }]);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const cleaned = tests.filter((x) => x.name.trim());
    if (!cleaned.length) return toast.error(t('common.error'));
    setSaving(true);
    try {
      await adminApi.addLabTest(visitId, { tests: cleaned });
      toast.success(t('focusMode.labCreated'));
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || t('common.error'));
    } finally { setSaving(false); }
  };

  return (
    <ModalShell title={t('focusMode.requestLab')} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {tests.map((tst, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={tst.name}
              onChange={(e) => {
                const next = [...tests]; next[i] = { name: e.target.value }; setTests(next);
              }}
              placeholder={t('focusMode.testName')}
              className="input flex-1"
              required
            />
            {tests.length > 1 && (
              <button type="button" onClick={() => setTests(tests.filter((_, idx) => idx !== i))} className="btn border border-ink-200 text-rose-600">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setTests([...tests, { name: '' }])} className="btn-outline w-full gap-1 text-sm">
          <Plus className="h-4 w-4" /> {t('focusMode.addTest')}
        </button>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-outline">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('common.submit')}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function RadiologyModal({ visitId, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [exams, setExams] = useState([{ name: '', bodyPart: '' }]);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const cleaned = exams.filter((x) => x.name.trim());
    if (!cleaned.length) return toast.error(t('common.error'));
    setSaving(true);
    try {
      await adminApi.addRadiology(visitId, { exams: cleaned });
      toast.success(t('focusMode.radCreated'));
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || t('common.error'));
    } finally { setSaving(false); }
  };

  return (
    <ModalShell title={t('focusMode.requestRadiology')} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        {exams.map((ex, i) => (
          <div key={i} className="grid grid-cols-5 gap-2">
            <input
              value={ex.name}
              onChange={(e) => { const next = [...exams]; next[i] = { ...next[i], name: e.target.value }; setExams(next); }}
              placeholder={t('focusMode.examName')}
              className="input col-span-3"
              required
            />
            <input
              value={ex.bodyPart}
              onChange={(e) => { const next = [...exams]; next[i] = { ...next[i], bodyPart: e.target.value }; setExams(next); }}
              placeholder={t('focusMode.bodyPart')}
              className="input col-span-2"
            />
          </div>
        ))}
        <button type="button" onClick={() => setExams([...exams, { name: '', bodyPart: '' }])} className="btn-outline w-full gap-1 text-sm">
          <Plus className="h-4 w-4" /> {t('focusMode.addExam')}
        </button>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-outline">{t('common.cancel')}</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {t('common.submit')}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 end-4 rounded-lg p-1 text-ink-500 hover:bg-ink-100">
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-4 text-xl font-black text-ink-900">{title}</h2>
        {children}
      </div>
    </div>
  );
}