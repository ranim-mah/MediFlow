import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer id="contact" className="bg-ink-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <Logo variant="light" />
            <p className="text-sm text-white/70 leading-relaxed">
              {t('hero.description').slice(0, 120)}...
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-white font-bold">{t('nav.services')}</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link to="/services" className="hover:text-white">{t('nav.services')}</Link></li>
              <li><Link to="/#booking" className="hover:text-white">{t('nav.bookNow')}</Link></li>
              <li><Link to="/#features" className="hover:text-white">{t('nav.features')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-white font-bold">{t('hero.address')}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{t('hero.addressValue')}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <span>9:00 - 18:00</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-white font-bold">{t('nav.contact')}</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+21671000000" className="hover:text-white" dir="ltr">+216 71 000 000</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@mediflow.test" className="hover:text-white">
                  contact@mediflow.test
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
