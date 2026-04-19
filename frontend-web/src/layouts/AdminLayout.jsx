import { Outlet } from 'react-router-dom';
import { Search, MoonStar, Building2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#e9eef7]">
      <AdminSidebar />

      <div className="lg:pe-[290px]">
        <header className="sticky top-0 z-30 border-b border-brand-900/20 bg-gradient-to-r from-[#0c2e67] via-[#133d7f] to-[#0e2b5e] px-4 py-3 text-white shadow-lg md:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="rounded-xl border border-white/30 bg-white px-3 py-1.5 text-sm font-bold text-ink-900">
              <span className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4" /> الفرع الرئيسي</span>
            </button>

            <button type="button" className="rounded-xl border border-brand-200/30 bg-[#0a2758] px-3 py-1.5 text-sm font-bold text-brand-100">
              <span className="inline-flex items-center gap-1.5"><Search className="h-4 w-4" /> بحث سريع (Ctrl+K)</span>
            </button>

            <button type="button" className="rounded-xl border border-white/25 bg-[#0a2758] px-3 py-1.5 text-sm font-bold text-white/90">
              <span className="inline-flex items-center gap-1.5"><MoonStar className="h-4 w-4" /> الوضع الداكن</span>
            </button>
          </div>
        </header>

        <main className="px-4 py-5 md:px-6 md:py-6">
          <div className="rounded-2xl border border-brand-100 bg-white/55 p-3 backdrop-blur-sm md:p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}