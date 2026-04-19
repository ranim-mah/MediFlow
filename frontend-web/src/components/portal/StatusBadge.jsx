import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

const STATUS_CLASSES = {
  pending: 'bg-[#fff3dd] text-[#b36d00]',
  confirmed: 'bg-[#e9f1ff] text-[#245ccf]',
  in_progress: 'bg-[#efe9ff] text-[#6b4fd6]',
  completed: 'bg-[#e6f7ee] text-[#1d8a58]',
  cancelled: 'bg-[#ffe8ea] text-[#c43f55]',
  no_show: 'bg-[#edf1f7] text-[#5f6e86]',
  waiting: 'bg-[#e6f4ff] text-[#1874c8]',
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
