import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  Stethoscope,
  Bell,
  LifeBuoy,
  LogOut,
  UserCog,
  BarChart2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/authApi';
import { cn } from '@/lib/cn';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { refreshToken, logout } = useAuthStore();

  const sections = [
    {
      title: 'الاستقبال والمرضى',
      links: [
        { to: '/admin', end: true, label: 'لوحة التحكم', icon: LayoutDashboard },
        { to: '/admin/patients', label: 'المرضى', icon: Users },
        { to: '/admin/appointments', label: 'المواعيد', icon: ClipboardList },
        { to: '/admin/calendar', label: 'التقويم', icon: CalendarDays },
      ],
    },
    {
      title: 'إدارة الموظفين',
      links: [
        { to: '/admin/staff', label: 'الموظفون', icon: UserCog },
        { to: '/admin/reports', label: 'التقارير المالية', icon: BarChart2 },
      ],
    },
    {
      title: 'النمط الطبي',
      links: [{ to: '/doctor', label: 'وضع الطبيب المركّز', icon: Stethoscope }],
    },
  ];

  const onLogout = async () => {
    try {
      await authApi.logout(refreshToken);
    } catch {}
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="brand-sidebar fixed inset-y-0 end-0 z-40 hidden w-[290px] overflow-y-auto border-s border-white/10 text-white lg:block">
      <div className="sticky top-0 border-b border-white/10 bg-[#0a2a5f]/95 px-5 py-4 backdrop-blur">
        <p className="text-2xl font-black leading-none">عيادة ميدي فلو</p>
        <p className="mt-1 text-xs text-white/60">نظام إدارة العيادة - Admin</p>
      </div>

      <div className="space-y-5 px-4 py-4">
        <button
          className="flex w-full items-center gap-2 rounded-xl bg-white/12 px-3 py-2.5 text-sm font-bold text-white hover:bg-white/18"
          type="button"
        >
          <Bell className="h-4 w-4" />
          الإشعارات
        </button>

        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl border border-white/10 bg-white/6 p-2.5">
            <p className="px-2 pb-2 text-xs font-bold text-white/60">{section.title}</p>
            <div className="space-y-1">
              {section.links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors',
                      isActive
                        ? 'bg-[#2d6df0] text-white shadow-lg'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={onLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-xl border border-white/20 bg-[#082347] px-3 py-2.5 text-sm font-bold text-white hover:bg-[#0a2c58]"
          type="button"
        >
          <LogOut className="h-4 w-4" />
          خروج
        </button>

        <button
          className="flex w-full items-center gap-2 rounded-xl border border-white/20 bg-transparent px-3 py-2.5 text-sm font-bold text-white/85 hover:bg-white/10"
          type="button"
        >
          <LifeBuoy className="h-4 w-4" />
          مركز المساعدة
        </button>
      </div>
    </aside>
  );
}
