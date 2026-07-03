import { useEffect, useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const TYPES = ['SICK', 'CASUAL', 'EARNED', 'UNPAID'];

export default function LeaveHistory() {
  const { user } = useAuth();
  const isManager = user.role === 'MANAGER';
  const location = useLocation();

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(location.state?.toast || '');
  const [filters, setFilters] = useState({ search: '', status: '', leave_type: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionError, setActionError] = useState('');

  const fetchLeaves = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.leave_type) params.leave_type = filters.leave_type;

    api
      .get('/leaves', { params })
      .then(({ data }) => setLeaves(data.data))
      .catch(() => setError('Could not load leave history.'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const startEdit = (leave) => {
    setEditingId(leave.id);
    setEditForm({
      leave_type: leave.leave_type,
      start_date: leave.start_date,
      end_date: leave.end_date,
      reason: leave.reason,
    });
    setActionError('');
  };

  const saveEdit = async (id) => {
    setActionError('');
    try {
      await api.put(`/leaves/${id}`, editForm);
      setEditingId(null);
      fetchLeaves();
    } catch (err) {
      setActionError(err.response?.data?.error?.message || 'Failed to update leave request.');
    }
  };

  const cancelLeave = async (id) => {
    if (!window.confirm('Cancel this leave request? This action cannot be undone.')) return;
    setActionError('');
    try {
      await api.delete(`/leaves/${id}`);
      fetchLeaves();
    } catch (err) {
      setActionError(err.response?.data?.error?.message || 'Failed to cancel leave request.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-dark">
            {isManager ? 'Team Leave History' : 'Leave History'}
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            {isManager ? "Search and filter your team's leave records." : 'View, edit, or cancel your leave requests.'}
          </p>
        </div>
        {!isManager && <Link to="/apply-leave" className="btn-primary">Apply for Leave</Link>}
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-success text-sm rounded-md px-3 py-2 mb-4">
          {toast}
        </div>
      )}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-md px-3 py-2 mb-4">
          {actionError}
        </div>
      )}

      <div className="card p-4 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          className="input sm:col-span-2"
          placeholder={isManager ? 'Search by employee, reason...' : 'Search by reason...'}
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={filters.leave_type} onChange={(e) => setFilters({ ...filters, leave_type: e.target.value })}>
          <option value="">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading leave records..." />
      ) : error ? (
        <p className="text-danger text-sm">{error}</p>
      ) : leaves.length === 0 ? (
        <div className="card p-10 text-center text-ink/50 text-sm">No leave records match your filters.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-left text-ink/60">
              <tr>
                {isManager && <th className="px-4 py-3 font-medium">Employee</th>}
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {!isManager && <th className="px-4 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  {isManager && (
                    <td className="px-4 py-3">
                      <div className="font-medium">{leave.employee_name}</div>
                      <div className="text-xs text-ink/50">{leave.employee_email}</div>
                    </td>
                  )}
                  {editingId === leave.id ? (
                    <>
                      <td className="px-4 py-3">
                        <select
                          className="input"
                          value={editForm.leave_type}
                          onChange={(e) => setEditForm({ ...editForm, leave_type: e.target.value })}
                        >
                          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <input type="date" className="input" value={editForm.start_date} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} />
                          <input type="date" className="input" value={editForm.end_date} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <textarea className="input" value={editForm.reason} onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })} />
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={leave.status} /></td>
                      <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                        <button className="btn-success !px-3 !py-1 text-xs" onClick={() => saveEdit(leave.id)}>Save</button>
                        <button className="btn-secondary !px-3 !py-1 text-xs" onClick={() => setEditingId(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{leave.leave_type}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{leave.start_date} &rarr; {leave.end_date} <span className="text-ink/40">({leave.total_days}d)</span></td>
                      <td className="px-4 py-3 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={leave.status} />
                        {leave.manager_comments && (
                          <p className="text-xs text-ink/50 mt-1 max-w-[180px]">"{leave.manager_comments}"</p>
                        )}
                      </td>
                      {!isManager && (
                        <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                          {leave.status === 'PENDING' ? (
                            <>
                              <button className="btn-secondary !px-3 !py-1 text-xs" onClick={() => startEdit(leave)}>Edit</button>
                              <button className="btn-danger !px-3 !py-1 text-xs" onClick={() => cancelLeave(leave.id)}>Cancel</button>
                            </>
                          ) : (
                            <span className="text-xs text-ink/30">&mdash;</span>
                          )}
                        </td>
                      )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
