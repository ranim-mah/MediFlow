import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Stethoscope, Pencil, FlaskConical, Activity, Send, FolderOpen,
  CheckCircle2, Loader2, Users, Calendar, FileText, HelpCircle,
  Zap, Info, BookOpen, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/adminApi';
import { formatDateTime } from '@/lib/dates';
import { PrescriptionModal, LabTestModal, RadiologyModal } from '@/components/admin/FocusModals';

export default function DoctorFocusModePage() {
  ...existing code...
}

function InfoChip({ label, value, dir }) {
  ...existing code...
}

function SummaryField({ label, value, onChange, disabled, placeholder }) {
  ...existing code...
}

function ChecklistItem({ done, label }) {
  ...existing code...
}

function NavChip({ label, desc, icon: Icon }) {
  ...existing code...
}

function AttachedCount({ label, count, icon: Icon }) {
  ...existing code...
}
