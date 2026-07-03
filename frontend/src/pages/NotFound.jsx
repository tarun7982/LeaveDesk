import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="font-display text-6xl font-semibold text-brand mb-2">404</p>
        <h1 className="text-xl font-semibold text-ink mb-2">Page not found</h1>
        <p className="text-sm text-ink/60 mb-6">The page you're looking for doesn't exist or may have moved.</p>
        <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );
}
