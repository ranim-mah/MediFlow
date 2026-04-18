import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { publicApi } from '@/lib/publicApi';
import ServiceCard from '@/components/public/ServiceCard';

export default function ServicesPage() {
  const { t } = useTranslation();
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['public', 'services'],
    queryFn: () => publicApi.listServices().then((r) => r.data || []),
  });

  return (
    <section className="bg-ink-50 pt-28 pb-16 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1 text-xs font-bold text-brand-700">
            {t('services.badge')}
          </span>
          <h1 className="mt-4 text-3xl font-black md:text-4xl">{t('services.title')}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-ink-500">{t('services.subtitle')}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
