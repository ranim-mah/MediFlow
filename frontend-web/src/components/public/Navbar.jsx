import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, UserCircle2, UserCog } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { cn } from '@/lib/cn';

export default function Navbar() {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/#booking', label: t('nav.bookNow') },
    { to: '/#features', label: t('nav.features') },
    { to: '/services', label: t('nav.services') },
    { to: '/#contact', label: t('nav.contact') },
  ];

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-soft' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center">
          <Logo variant={scrolled ? 'dark' : 'light'} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={cn(
                'text-sm font-semibold transition-colors',
                scrolled ? 'text-ink-700 hover:text-brand-700' : 'text-white/90 hover:text-white'
              )}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher variant={scrolled ? 'dark' : 'light'} />
          <Link
            to="/admin"
            className={cn(
              'btn gap-2 px-4 py-2 text-sm',
              scrolled
                ? 'bg-ink-100 text-ink-800 hover:bg-ink-200'
                : 'bg-white/10 text-white backdrop-blur-md hover:bg-white/20'
            )}
          >
            <UserCog className="h-4 w-4" /> {t('nav.adminPortal')}
          </Link>
          <Link to="/portal" className="btn-primary gap-2 px-4 py-2 text-sm">
            <UserCircle2 className="h-4 w-4" /> {t('nav.patientPortal')}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'md:hidden rounded-lg p-2',
            scrolled ? 'text-ink-800' : 'text-white'
          )}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white shadow-soft">
          <div className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 font-semibold text-ink-700 hover:bg-ink-100"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-3 flex items-center justify-between gap-2">
              <LanguageSwitcher variant="dark" />
            </div>
            <Link to="/admin" className="btn mt-3 w-full" onClick={() => setOpen(false)}>
              {t('nav.adminPortal')}
            </Link>
            <Link to="/portal" className="btn-primary mt-3 w-full" onClick={() => setOpen(false)}>
              {t('nav.patientPortal')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
