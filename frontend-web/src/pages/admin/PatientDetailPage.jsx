import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  UserRound, Users, ListOrdered, Printer, Pencil, CalendarPlus,
  FilePlus, FlaskConical, Activity, Scissors, Receipt, Paperclip,
  Bell, Info, BookOpen, HelpCircle, Phone, Loader2, ArrowRight,
  Droplet, Eye, RefreshCw,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { formatDate, formatDateTime } from '@/lib/dates';

const RoleChip = ({ label }) => (
  ...existing code...
);

const ActionPill = ({ onClick, icon: Icon, label, tone = 'default' }) => {
  ...existing code...
};

export default function PatientDetailPage() {
  ...existing code...
}

function badgeClassForStatus(s) {
  ...existing code...
}

function RecentCard({ icon: Icon, title, date, detail, doctor, empty, emptyText, actions, lang }) {
  ...existing code...
}

function MiniStat({ label, value, hint, dir }) {
  ...existing code...
}

function FinancialRow({ label, value, tone = 'default' }) {
  ...existing code...
}
