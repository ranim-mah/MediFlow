import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ar, fr, enUS } from 'date-fns/locale';

const localeMap = { ar, fr, en: enUS };

export const getDateLocale = (lang) => localeMap[lang] || enUS;

export const formatDateTime = (d, lang = 'en') => {
  if (!d) return '—';
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'yyyy-MM-dd HH:mm', { locale: getDateLocale(lang) });
};

export const formatDate = (d, lang = 'en') => {
  if (!d) return '—';
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'yyyy-MM-dd', { locale: getDateLocale(lang) });
};

export const formatTime = (d) => {
  if (!d) return '—';
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'HH:mm');
};

export const timeAgo = (d, lang = 'en') => {
  if (!d) return '';
  const date = typeof d === 'string' ? parseISO(d) : d;
  return formatDistanceToNow(date, { addSuffix: true, locale: getDateLocale(lang) });
};
