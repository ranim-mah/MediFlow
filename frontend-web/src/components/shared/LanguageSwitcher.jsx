import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { LANGUAGES } from '@/lib/i18n';
import { cn } from '@/lib/cn';

export default function LanguageSwitcher({ variant = 'light' }) {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl p-1 text-sm',
        variant === 'light' ? 'bg-white/10 backdrop-blur-md' : 'bg-ink-100'
      )}
    >
      <Globe
        className={cn('h-4 w-4 mx-1.5', variant === 'light' ? 'text-white/80' : 'text-ink-500')}
      />
      {LANGUAGES.map((l) => {
        const active = current === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => i18n.changeLanguage(l.code)}
            className={cn(
              'rounded-lg px-2.5 py-1 font-semibold transition-colors',
              active
                ? variant === 'light'
                  ? 'bg-white text-brand-800'
                  : 'bg-brand-600 text-white'
                : variant === 'light'
                ? 'text-white/80 hover:text-white'
                : 'text-ink-600 hover:text-ink-900'
            )}
          >
            {l.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
