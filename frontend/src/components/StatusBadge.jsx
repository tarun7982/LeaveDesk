export default function StatusBadge({ status }) {
  const map = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
    CANCELLED: 'badge-cancelled',
  };
  return <span className={`badge ${map[status] || 'badge-cancelled'}`}>{status}</span>;
}
