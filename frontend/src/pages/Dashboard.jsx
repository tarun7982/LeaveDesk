import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';


function StatCard({ label, value, accent }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-ink/60">{label}</p>
      <p className={`text-3xl font-display font-semibold mt-1 ${accent || 'text-ink'}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isManager = user.role === 'MANAGER';
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get('/leaves/dashboard-stats')
      .then(({ data }) => mounted && setStats(data.data))
      .catch(() => mounted && setError('Could not load dashboard statistics.'))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-brand-dark">
          Welcome back, {user.name.split(' ')[0]}
        </h1>
        <p className="text-sm text-ink/60 mt-1">
          {isManager ? "Here's an overview of your team's leave activity." : "Here's an overview of your leave activity."}
        </p>
      </div>

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Requests" value={stats.total} />
          <StatCard label="Approved" value={stats.approved} accent="text-success" />
          <StatCard label="Pending" value={stats.pending} accent="text-accent" />
          <StatCard label="Rejected" value={stats.rejected} accent="text-danger" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        {isManager ? (
          <Link to="/pending-approvals" className="btn-primary">Review Pending Approvals</Link>
        ) : (
          <Link to="/apply-leave" className="btn-primary">Apply for Leave</Link>
        )}
        <Link to="/leave-history" className="btn-secondary">View Full History</Link>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-ink">Recent Activity</h2>
        </div>
        {stats?.recent?.length ? (
          <ul className="divide-y divide-slate-100">
            {stats.recent.map((item) => (
              <li key={item.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  {isManager && <span className="font-medium text-ink mr-2">{item.employee_name}</span>}
                  <span className="text-ink/70">{item.leave_type}</span>
                  <span className="text-ink/40 mx-2">&middot;</span>
                  <span className="text-ink/50">{item.start_date} to {item.end_date}</span>
                </div>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-6 text-sm text-ink/50">No recent activity yet.</p>
        )}
      </div>
    </div>
  );
}
