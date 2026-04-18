import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-ink-50 pt-24">
      <div className="text-center">
        <p className="text-8xl font-black text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-black text-ink-900">Page not found</h1>
        <Link to="/" className="btn-primary mt-6">
          <Home className="h-5 w-5" />
          Home
        </Link>
      </div>
    </section>
  );
}
