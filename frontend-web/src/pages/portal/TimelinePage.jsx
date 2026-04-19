import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar, FileEdit, FlaskConical, Activity, Scissors, Eye,
  Layers, ArrowRight, ListOrdered, Loader2, FolderOpen,
} from 'lucide-react';
import { patientApi } from '@/lib/patientApi';
import StatusBadge from '@/components/portal/StatusBadge';
import { formatDateTime, formatDate } from '@/lib/dates';

const TYPE_META = {
  appointment: { icon: Calendar, color: 'bg-blue-100 text-blue-700' },
  visit: { icon: Activity, color: 'bg-violet-100 text-violet-700' },
  prescription: { icon: FileEdit, color: 'bg-emerald-100 text-emerald-700' },
  lab: { icon: FlaskConical, color: 'bg-amber-100 text-amber-700' },
  radiology: { icon: Activity, color: 'bg-rose-100 text-rose-700' },
  procedure: { icon: Scissors, color: 'bg-cyan-100 text-cyan-700' },
};

export default function TimelinePage() {
  const { t, i18n } = useTranslation();
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['patient', 'timeline'],
    queryFn: () => patientApi.getTimeline().then((r) => r.data),
  });

  const events = useMemo(() => {
    const all = data?.events || [];
    if (filter === 'all') return all;
    return all.filter((e) => e.type === filter);
  }, [data, filter]);

  // Group events by YYYY-MM for the month headings
  const groups = useMemo(() => {
    const map = new Map();
    events.forEach((e) => {
      const key = new Date(e.date).toISOString().slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });
    return Array.from(map.entries());
  }, [events]);

  const counts = data?.counts || {};

  const filters = [
    { key: 'all', label: t('portal.timeline.all'), icon: Layers, count: counts.total },
    { key: 'appointment', label: t('portal.timeline.appointments'), icon: Calendar, count: counts.appointments },
    { key: 'prescription', label: t('portal.timeline.prescriptions'), icon: FileEdit, count: counts.prescriptions },
    { key: 'lab', label: t('portal.timeline.labs'), icon: FlaskConical, count: counts.labs },
    { key: 'radiology', label: t('portal.timeline.radiology'), icon: Activity, count: counts.radiology },
    { key: 'procedure', label: t('portal.timeline.procedures'), icon: Scissors, count: counts.procedures },
    { key: 'visit', label: t('portal.timeline.visits'), icon: Eye, count: counts.visits },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
              <Layers className="h-3.5 w-3.5" /> {t('portal.timeline.badge')}
            </span>
            <h1 className="mt-3 text-2xl font-black md:text-3xl">
              <ListOrdered className="inline h-7 w-7 text-brand-700 me-2" />
              {t('portal.timeline.title')}
            </h1>
            <p className="mt-1 text-ink-500">{t('portal.timeline.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/portal/medical-file" className="btn-outline gap-2">
              <FolderOpen className="h-4 w-4" />
              {t('portal.timeline.medicalFile')}
            </Link>
            <Link to="/portal" className="btn-outline gap-2">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              {t('portal.timeline.back')}
            </Link>
          </div>
        </div>
      </section>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              filter === f.key
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-ink-700 hover:bg-ink-100 shadow-card'
            }`}
          >
            <f.icon className="h-4 w-4" />
            {f.label}
            <span className={`rounded-full px-2 py-0.5 text-xs font-black ${
              filter === f.key ? 'bg-white/20' : 'bg-ink-100 text-ink-700'
            }`}>
              {f.count ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-ink-500">{t('portal.timeline.noEvents')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([monthKey, items]) => (
            <div key={monthKey}>
              <div className="mb-4 flex justify-end">
                <span className="inline-flex items-center rounded-full bg-ink-900 px-4 py-1.5 text-sm font-bold text-white">
                  {new Date(monthKey + '-01').toLocaleDateString(i18n.language, {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((evt, idx) => (
                  <TimelineEvent key={`${evt.type}-${evt.id}-${idx}`} event={evt} lang={i18n.language} t={t} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineEvent({ event, lang, t }) {
  const meta = TYPE_META[event.type] || { icon: Layers, color: 'bg-ink-100 text-ink-700' };
  const Icon = meta.icon;

  return (
    <div className="flex gap-4">
      <div className="flex shrink-0 flex-col items-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${meta.color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex-1 rounded-2xl bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="badge bg-brand-100 text-brand-800">
              {t(`portal.timeline.${event.type === 'lab' ? 'labs' : event.type === 'radiology' ? 'radiology' : event.type + 's'}`, event.type)}
            </span>
            {event.status && <StatusBadge status={event.status === 'in_session' ? 'in_progress' : event.status} />}
          </div>
          <time className="text-sm font-bold text-ink-600" dir="ltr">
            {formatDateTime(event.date, lang)}
          </time>
        </div>

        <p className="mt-2 font-black text-ink-900">{event.title || '—'}</p>
        {event.doctor && <p className="text-sm text-ink-500">د / {event.doctor}</p>}

        <button className="btn-ghost mt-3 gap-1 px-3 py-1 text-xs">
          <Eye className="h-3.5 w-3.5" />
          {t('portal.timeline.viewDetails')}
        </button>
      </div>
    </div>
  );
}
