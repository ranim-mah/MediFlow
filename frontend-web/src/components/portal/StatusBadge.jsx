import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

const STATUS_CLASSES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-violet-100 text-violet-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-rose-100 text-rose-800',
  no_show: 'bg-ink-100 text-ink-700',
  waiting: 'bg-sky-100 text-sky-800',
};

export default function StatusBadge({ status, className }) {
  const { t } = useTranslation();
  return (
    <span className={cn('badge', STATUS_CLASSES[status] || 'bg-ink-100 text-ink-700', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {t(`statuses.${status}`, status)}
    </span>
  );
}
