import { cn } from '@/lib/cn';

export default function Logo({ className, variant = 'light' }) {
  const isLight = variant === 'light';
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl shadow-md',
          isLight ? 'bg-white' : 'bg-brand-600'
        )}
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6">
          <path
            d="M6 24V8l10 14L26 8v16"
            stroke={isLight ? '#1e4eaf' : '#fff'}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={cn('font-black text-lg', isLight ? 'text-white' : 'text-ink-900')}>
          Mediflow
        </span>
        <span className={cn('text-xs font-medium', isLight ? 'text-white/70' : 'text-ink-500')}>
          Smart Clinic
        </span>
      </div>
    </div>
  );
}
