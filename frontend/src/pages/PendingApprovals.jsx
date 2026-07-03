import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

export default function PendingApprovals() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [comment, setComment] = useState('');
  const [actionError, setActionError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const fetchPending = useCallback(() => {
    setLoading(true);
    api
      .get('/pending-leaves', { params: search ? { search } : {} })
      .then(({ data }) => setLeaves(data.data))
      .catch(() => setError('Could not load pending approvals.'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const approve = async (id) => {
    setActionError('');
    setBusyId(id);
    try {
      await api.put(`/leaves/${id}/approve`, {});
      fetchPending();
    } catch (err) {
      setActionError(err.response?.data?.error?.message || 'Failed to approve leave request.');
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id) => {
    if (!comment.trim()) {
      setActionError('Please add a comment explaining the rejection.');
      return;
    }
    setActionError('');
    setBusyId(id);
    try {
      await api.put(`/leaves/${id}/reject`, { comments: comment });
      setRejectingId(null);
      setComment('');
      fetchPending();
    } catch (err) {
      setActionError(err.response?.data?.error?.message || 'Failed to reject leave request.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-brand-dark">Pending Approvals</h1>
        <p className="text-sm text-ink/60 mt-1">Review and act on your team's leave requests.</p>
      </div>

      <div className="card p-4 mb-6">
        <input
          className="input"
          placeholder="Search by employee name, email, or reason..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-md px-3 py-2 mb-4">{actionError}</div>
      )}

      {loading ? (
        <Spinner label="Loading pending requests..." />
      ) : error ? (
        <p className="text-danger text-sm">{error}</p>
      ) : leaves.length === 0 ? (
        <div className="card p-10 text-center text-ink/50 text-sm">No pending leave requests. You're all caught up.</div>
      ) : (
        <div className="space-y-4">
          {leaves.map((leave) => (
            <div key={leave.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">{leave.employee_name}</p>
                  <p className="text-xs text-ink/50">{leave.employee_email} &middot; {leave.employee_department}</p>
                </div>
                <StatusBadge status={leave.status} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
                <div>
                  <p className="text-ink/50 text-xs">Type</p>
                  <p className="font-medium">{leave.leave_type}</p>
                </div>
                <div>
                  <p className="text-ink/50 text-xs">Dates</p>
                  <p className="font-medium">{leave.start_date} &rarr; {leave.end_date}</p>
                </div>
                <div>
                  <p className="text-ink/50 text-xs">Duration</p>
                  <p className="font-medium">{leave.total_days} day(s)</p>
                </div>
                <div className="sm:col-span-1 col-span-2">
                  <p className="text-ink/50 text-xs">Reason</p>
                  <p className="font-medium">{leave.reason}</p>
                </div>
              </div>

              {rejectingId === leave.id ? (
                <div className="mt-4 space-y-2">
                  <label className="label">Rejection comments (required)</label>
                  <textarea
                    className="input"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Explain why this request is being rejected"
                  />
                  <div className="flex gap-2">
                    <button className="btn-danger" disabled={busyId === leave.id} onClick={() => reject(leave.id)}>
                      {busyId === leave.id ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                    <button className="btn-secondary" onClick={() => { setRejectingId(null); setComment(''); setActionError(''); }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-4">
                  <button className="btn-success" disabled={busyId === leave.id} onClick={() => approve(leave.id)}>
                    {busyId === leave.id ? 'Approving...' : 'Approve'}
                  </button>
                  <button className="btn-danger" onClick={() => setRejectingId(leave.id)}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
