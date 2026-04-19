import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Calendar, Users, Hash, Loader2, Clock } from 'lucide-react';
import { patientApi } from '@/lib/patientApi';
import { formatDateTime } from '@/lib/dates';
import StatusBadge from '@/components/portal/StatusBadge';

const BigNumber = ({ label, value, tone = 'white' }) => (
  <div className={`rounded-2xl p-6 text-center ${tone === 'white' ? 'bg-white/15 backdrop-blur-sm' : 'bg-white text-ink-900'}`}>
    <p className={`text-sm font-semibold ${tone === 'white' ? 'text-white/80' : 'text-ink-500'}`}>{label}</p>
    <p className={`mt-2 text-5xl font-black ${tone === 'white' ? 'text-white' : 'text-ink-900'}`}>{value}</p>
  </div>
);

export default function QueuePage() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['patient', 'queue'],
    queryFn: () => patientApi.getQueue().then((r) => r.data),
    refetchInterval: 30000, // poll every 30s
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black md:text-3xl">
            <Hash className="inline h-7 w-7 text-brand-700 me-2" />
            {t('portal.queue.title')}
          </h1>
          <p className="mt-1 text-ink-500">{t('portal.queue.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-primary gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : !data?.hasEntry ? (
        <div className="card text-center py-16">
          <Clock className="mx-auto mb-4 h-12 w-12 text-ink-300" />
          <h2 className="text-xl font-black">{t('portal.queue.noEntry')}</h2>
          <p className="mt-2 text-ink-500">{t('portal.queue.noEntryDesc')}</p>
        </div>
      ) : (
        <>
          {/* Big queue panel (matches image 4) */}
          <section className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-950 p-6 text-white shadow-xl md:p-8">
            <div className="flex items-start justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold backdrop-blur-md ring-1 ring-white/20">
                <Users className="h-3.5 w-3.5" />
                {t('portal.queue.statusToday')}
              </span>
            </div>

            <div className="mt-6 md:mt-8 md:flex md:items-start md:justify-between md:gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-black md:text-3xl">
                  {data.appointment?.serviceId?.name?.[i18n.language] || '—'}
                </h2>
                <p className="mt-2 text-sm text-white/80" dir="ltr">
                  {data.appointment?.scheduledAt && formatDateTime(data.appointment.scheduledAt, i18n.language)}
                </p>
                {data.doctor && <p className="mt-1 text-sm text-white/80">د / {data.doctor}</p>}
                <div className="mt-3">
                  <StatusBadge status={data.status === 'waiting' ? 'pending' : data.status} />
                </div>

                <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <h3 className="font-bold">{t('portal.queue.quickSummary')}</h3>
                  <p className="mt-1 text-sm text-white/80">{t('portal.queue.quickSummaryDesc')}</p>
                  {data.ahead === 0 && (
                    <div className="mt-3 rounded-xl bg-amber-100 p-3 text-sm text-amber-900">
                      {t('portal.queue.noQueue')}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3 md:mt-0">
                <BigNumber label={t('portal.queue.ahead')} value={data.ahead ?? 0} />
                <BigNumber label={t('portal.queue.currentlyServing')} value={data.currentNumber ?? 0} />
                <BigNumber label={t('portal.queue.myNumber')} value={data.myNumber ?? 0} tone="white" />
              </div>
            </div>
          </section>

          {/* Bottom info grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="card">
              <h3 className="font-black text-ink-900">{t('portal.queue.completedToday')}</h3>
              <p className="mt-3 text-4xl font-black text-brand-700">{data.completedToday}</p>
              <p className="mt-2 text-sm text-ink-500">{t('portal.queue.completedDesc')}</p>
            </div>
            <div className="card">
              <h3 className="font-black text-ink-900">{t('portal.queue.currentStatus')}</h3>
              <p className="mt-3 text-2xl font-black">{t(`statuses.${data.status === 'waiting' ? 'pending' : data.status}`, data.status)}</p>
              <p className="mt-2 text-sm text-ink-500">{t('portal.queue.statusDesc')}</p>
            </div>
            <div className="card border-l-4 border-amber-400">
              <h3 className="font-black text-ink-900">{t('portal.queue.note')}</h3>
              <p className="mt-2 text-sm text-ink-500">{t('portal.queue.noteDesc')}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
