import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'MANAGER') {
      setEmail('manager@company.com');
      setPassword('Password@123');
    } else {
      setEmail('employee@company.com');
      setPassword('Password@123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-brand-dark">LeaveDesk</h1>
          <p className="text-sm text-ink/60 mt-1">Sign in to manage your leave requests</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4" noValidate>
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-danger text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-ink/50">
          <p className="mb-2">Demo accounts</p>
          <div className="flex justify-center gap-2">
            <button type="button" onClick={() => fillDemo('EMPLOYEE')} className="btn-secondary !py-1 !px-3 text-xs">
              Fill Employee
            </button>
            <button type="button" onClick={() => fillDemo('MANAGER')} className="btn-secondary !py-1 !px-3 text-xs">
              Fill Manager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
