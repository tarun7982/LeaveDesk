import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-light text-brand' : 'text-ink/70 hover:bg-slate-100'
    }`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isManager = user?.role === 'MANAGER';

  return (
    <header className="bg-transparent border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm ">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <span className="font-display text-lg font-semibold text-brand-dark">LeaveDesk</span>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            {!isManager && (
              <>
                <NavLink to="/apply-leave" className={linkClass}>Apply Leave</NavLink>
                <NavLink to="/leave-history" className={linkClass}>Leave History</NavLink>
              </>
            )}
            {isManager && (
              <>
                <NavLink to="/pending-approvals" className={linkClass}>Pending Approvals</NavLink>
                <NavLink to="/leave-history" className={linkClass}>Team Leave History</NavLink>
              </>
            )}
            <NavLink to="/profile" className={linkClass}>Profile</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-ink/60">
            {user?.name} <span className="text-ink/40">&middot; {user?.role}</span>
          </span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </div>
    </header>
  );
}
