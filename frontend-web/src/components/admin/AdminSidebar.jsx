import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import {
  Home, Bell, HelpCircle, Zap, Megaphone, Users, UserRound, Copy,
  AlertTriangle, Calendar, UsersRound, Stethoscope, DollarSign, BookOpen,
  ChevronDown, Star, Search,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export default function AdminSidebar({ open, onClose }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState({ reception: true, finance: false, staff: false, medical: false });

  const toggle = (k) => setExpanded((e) => ({ ...e, [k]: !e[k] }));

  const topLinks = [
    { to: '/admin', label: t('admin.sidebar.dashboard'), icon: Home, end: true },
    { to: '/admin/notifications', label: t('admin.sidebar.notifications'), icon: Bell, count: 0 },
    { to: '/admin/help', label: t('admin.sidebar.helpCenter'), icon: HelpCircle },
  ];

  const groups = [
    {
      key: 'shortcuts',
      title: t('admin.sidebar.quickShortcuts'),
      items: [
        { to: '/admin/shortcuts', label: t('admin.sidebar.notificationsCenter'), icon: Megaphone },
      ],
    },
          {
            key: 'reception',
            title: t('admin.sidebar.receptionPatients'),
            count: 4,
            collapsible: true,
            items: [
              { to: '/admin/patients', label: t('admin.sidebar.patients'), icon: UserRound },
              { to: '/admin/duplicates', label: t('admin.sidebar.duplicates'), icon: Copy },
              { to: '/admin/high-risk', label: t('admin.sidebar.highRiskPatients'), icon: AlertTriangle },
              { to: '/admin/appointments', label: t('admin.sidebar.appointments'), icon: Calendar },
            ],
          },
          {
            key: 'staff',
            title: t('admin.sidebar.staffManagement'),
            count: 6,
            collapsible: true,
            items: [
              { to: '/admin/staff', label: t('admin.sidebar.staffManagement'), icon: UsersRound },
            ],
          },
          {
            key: 'medical',
            title: t('admin.sidebar.medicalManagement'),
            count: 16,
            collapsible: true,
            items: [
              { to: '/admin/medical', label: t('admin.sidebar.medicalManagement'), icon: Stethoscope },
            ],
          },
          {
            key: 'finance',
            title: t('admin.sidebar.finance'),
            count: 9,
            collapsible: true,
            items: [
              { to: '/admin/accounting', label: t('admin.sidebar.accounting'), icon: BookOpen },
            ],
          },
        ];

  return (
    <>
      {/* Backdrop on mobile */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          'fixed z-40 top-0 bottom-0 w-72 bg-ink-950 text-white transition-transform duration-300 overflow-y-auto',
          // Right-side in RTL, left-side in LTR (Tailwind's logical classes)
          'end-0',
          open ? 'translate-x-0' : 'translate-x-full rtl:-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Search */}
        <div className="sticky top-0 bg-ink-950 p-4 pb-2">
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 start-3" />
            <input
              placeholder={t('admin.sidebar.quickShortcuts') + '...'}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 ps-10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400"
            />
          </div>
          <p className="mt-2 text-xs text-white/50">
            ثبّت الروابط المهمة واضغط على عناوين الأقسام للطي والفتح
          </p>
        </div>

        <nav className="p-2">
          {/* Top links */}
          <div className="space-y-1">
            {topLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                    isActive ? 'bg-brand-600 text-white' : 'text-white/80 hover:bg-white/5'
                  )
                }
              >
                <div className="flex items-center gap-2">
                  <l.icon className="h-4 w-4" />
                  <span>{l.label}</span>
                </div>
                {typeof l.count === 'number' && (
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{l.count}</span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Groups */}
          <div className="mt-4 space-y-4">
            {groups.map((g) => {
              const isOpen = expanded[g.key] ?? true;
              return (
                <div key={g.key}>
                  <button
                    onClick={() => g.collapsible && toggle(g.key)}
                    className="flex w-full items-center justify-between px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white/80"
                  >
                    <span className="flex items-center gap-2">
                      <span>{g.title}</span>
                      {typeof g.count === 'number' && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                          {g.count}
                        </span>
                      )}
                    </span>
                    {g.collapsible && (
                      <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', !isOpen && '-rotate-90')} />
                    )}
                  </button>
                  {isOpen && (
                    <div className="mt-1 space-y-0.5">
                      {g.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors',
                              isActive
                                ? 'bg-white/10 text-white font-bold'
                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                            )
                          }
                        >
                          <div className="flex items-center gap-2">
                            <Star className="h-3.5 w-3.5 text-white/30" />
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </div>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
