import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  CalendarCheck2,
  FileText,
  Bell,
  FlaskConical,
  MapPin,
  Clock,
  LogIn,
  Sparkles,
} from 'lucide-react';
import QuickBookingForm from '@/components/public/QuickBookingForm';

const FeatureChip = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md ring-1 ring-white/20">
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </div>
);

const InfoBlock = ({ icon: Icon, title, value }) => (
  <div className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-white backdrop-blur-sm ring-1 ring-white/10">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-xs text-white/70">{title}</p>
      <p className="font-bold">{value}</p>
    </div>
  </div>
);

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero section */}
      <section className="hero-bg relative overflow-hidden pt-28 pb-16 md:pt-32 md:pb-24">
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -end-20 top-20 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -start-20 bottom-0 h-96 w-96 rounded-full bg-brand-300/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 md:gap-6 md:px-6">
          {/* Left — hero content */}
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              {t('hero.tagline')}
            </div>

            <h1 className="mb-5 text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
              {t('hero.title')} <span>{t('hero.titleEmoji')}</span>
            </h1>

            <p className="mb-7 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              {t('hero.description')}
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              <a href="#booking" className="btn-primary text-base">
                <CalendarCheck2 className="h-5 w-5" />
                {t('hero.bookNow')}
              </a>
              <Link
                to="/portal"
                className="btn border-2 border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
              >
                <LogIn className="h-5 w-5" />
                {t('hero.enterPortal')}
              </Link>
            </div>

            <div className="mb-8 flex flex-wrap gap-2" id="features">
              <FeatureChip icon={FileText} label={t('hero.features.organized')} />
              <FeatureChip icon={FlaskConical} label={t('hero.features.results')} />
              <FeatureChip icon={Bell} label={t('hero.features.notifications')} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBlock
                icon={Clock}
                title={t('hero.workingHours')}
                value={t('hero.daily')}
              />
              <InfoBlock
                icon={MapPin}
                title={t('hero.address')}
                value={t('hero.addressValue')}
              />
            </div>
          </div>

          {/* Right — booking form */}
          <div className="flex items-start justify-center md:justify-end">
            <QuickBookingForm />
          </div>
        </div>
      </section>

      {/* Services teaser */}
      <ServicesTeaser />
    </>
  );
}

// Services section on the landing
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/publicApi';
import ServiceCard from '@/components/public/ServiceCard';

function ServicesTeaser() {
  const { t } = useTranslation();
  const { data: services = [] } = useQuery({
    queryKey: ['public', 'services'],
    queryFn: () => publicApi.listServices().then((r) => r.data || []),
  });

  return (
    <section className="bg-ink-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1 text-xs font-bold text-brand-700">
            {t('services.badge')}
          </span>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">{t('services.title')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-ink-500">{t('services.subtitle')}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((s) => (
            <ServiceCard key={s._id} service={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
