import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Printer, ArrowRight } from 'lucide-react';

export default function MedicalFilePrintPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-bold text-brand-700">
          <Printer className="h-3.5 w-3.5" />
          {t('portal.medicalFile.printFull')}
        </span>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-[#19233f] md:text-3xl">
          {t('portal.medicalFile.printFull')}
        </h1>
        <p className="mt-1 text-[#6d7ea6]">
          This is the print-friendly destination for the medical file.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/portal/medical-file" className="btn-outline gap-2">
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            {t('portal.medicalFile.backDashboard')}
          </Link>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#e7eef8] bg-white p-6 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
        <p className="text-sm text-[#6d7ea6]">Print layout placeholder ready for the next iteration.</p>
      </section>
    </div>
  );
}
