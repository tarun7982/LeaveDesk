import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import leaveBgStyle from '../assets/leave-bg.png';

const LEAVE_TYPES = ['SICK', 'CASUAL', 'EARNED', 'UNPAID'];

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ leave_type: 'CASUAL', start_date: '', end_date: '', reason: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.start_date) errs.start_date = 'Start date is required';
    if (!form.end_date) errs.end_date = 'End date is required';
    if (form.start_date && form.end_date && form.start_date > form.end_date) {
      errs.end_date = 'End date must be on or after the start date';
    }
    if (!form.reason || form.reason.trim().length < 3) errs.reason = 'Please provide a brief reason (min 3 characters)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post('/leaves', form);
      navigate('/leave-history', { state: { toast: 'Leave request submitted successfully.' } });
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl ">
      <h1 className="font-display text-2xl font-semibold text-brand-dark mb-1">Apply for Leave</h1>
      <p className="text-sm text-ink/60 mb-6">Fill in the details below. Your manager will be notified for review.</p>

      <div className="flex ">
      <form onSubmit={handleSubmit} className="card p-4 space-y-4 w-full shrink-0" noValidate>
        {serverError && (
          <div role="alert" className="bg-red-50 border border-red-200 text-danger text-sm rounded-md px-3 py-2"> 
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="leave_type" className="label">Leave Type</label>
          <select id="leave_type" className="input" value={form.leave_type} onChange={handleChange('leave_type')}>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date" className="label">Start Date</label>
            <input
              id="start_date"
              type="date"
              className="input"
              value={form.start_date}
              onChange={handleChange('start_date')}
              aria-invalid={!!errors.start_date}
            />
            {errors.start_date && <p className="text-xs text-danger mt-1">{errors.start_date}</p>}
          </div>
          <div>
            <label htmlFor="end_date" className="label">End Date</label>
            <input
              id="end_date"
              type="date"
              className="input"
              value={form.end_date}
              onChange={handleChange('end_date')}
              aria-invalid={!!errors.end_date}
            />
            {errors.end_date && <p className="text-xs text-danger mt-1">{errors.end_date}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="label">Reason</label>
          <textarea
            id="reason"
            className="input min-h-[100px]"
            value={form.reason}
            onChange={handleChange('reason')}
            aria-invalid={!!errors.reason}
            placeholder="Briefly describe the reason for your leave"
          />
          {errors.reason && <p className="text-xs text-danger mt-1">{errors.reason}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>
      </form>
      <img className = "apply-leave-bg ml-20" src = {leaveBgStyle} alt="Leave background" />
      </div>
    </div>
  );
}
