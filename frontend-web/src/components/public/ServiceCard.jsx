import { useTranslation } from 'react-i18next';
import {
  Stethoscope,
  MessageCircle,
  HeartPulse,
  Waves,
  Syringe,
  Bandage,
  Activity,
} from 'lucide-react';

const ICON_MAP = {
  GEN: Stethoscope,
  CONS: MessageCircle,
  ECG: HeartPulse,
  US: Waves,
  GLU: Syringe,
  DRES: Bandage,
};

export default function ServiceCard({ service }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const name = service.name?.[lang] || service.name?.ar || service.name?.en || '—';
  const desc = service.description?.[lang] || t('services.defaultDesc');
  const Icon = ICON_MAP[service.code] || Activity;

  return (
    <article className="group rounded-2xl bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-soft">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-2 text-lg font-black text-ink-900">{name}</h3>
      <p className="text-sm leading-relaxed text-ink-500">{desc}</p>
      {service.price > 0 && (
        <div className="mt-4 inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
          {service.price} {service.currency || 'EGP'}
        </div>
      )}
    </article>
  );
}
