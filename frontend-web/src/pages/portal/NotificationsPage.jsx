import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { patientApi } from '@/lib/patientApi';
import { timeAgo } from '@/lib/dates';
import { cn } from '@/lib/cn';

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['patient', 'notifications'],
    queryFn: () => patientApi.listNotifications().then((r) => r.data),
  });

  const markOneMut = useMutation({
    mutationFn: (id) => patientApi.markNotificationRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });

  const markAllMut = useMutation({
    mutationFn: () => patientApi.markAllNotificationsRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient'] }),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black md:text-3xl">
            <Bell className="inline h-7 w-7 text-brand-700 me-2" />
            {t('portal.nav.notifications')}
          </h1>
          <p className="mt-1 text-ink-500">
            {unreadCount} {t('portal.dashboard.unreadNotifications')}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending}
            className="btn-outline gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="mx-auto mb-4 h-12 w-12 text-ink-300" />
          <p className="text-ink-500">{t('common.noData')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markOneMut.mutate(n._id)}
              className={cn(
                'flex cursor-pointer gap-4 rounded-2xl p-4 shadow-card transition-colors',
                n.isRead ? 'bg-white' : 'bg-brand-50 border border-brand-200'
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-ink-900">{n.title}</p>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-brand-600" />}
                </div>
                {n.body && <p className="mt-1 text-sm text-ink-600">{n.body}</p>}
                <p className="mt-2 text-xs text-ink-400">{timeAgo(n.createdAt, i18n.language)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
