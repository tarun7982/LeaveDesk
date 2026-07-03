import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import profilebg from '../assets/profile-bg.png';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/employees/${user.id}`)
      .then(({ data }) => setProfile(data.data))
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading) return <Spinner label="Loading profile..." />;
  if (error) return <p className="text-danger text-sm">{error}</p>;

  const fields = [
    ['Full Name', profile.name],
    ['Email', profile.email],
    ['Department', profile.department],
    ['Role', profile.role],
    ['Leave Balance', `${profile.leave_balance} days`],
    ['Member Since', new Date(profile.created_at).toLocaleDateString()],
  ];

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-semibold text-brand-dark mb-6">Employee Profile</h1>
      <div className="flex">
      <div className="card divide-y divide-slate-100 w-full shrink-0">
        {fields.map(([label, value]) => (
          <div key={label} className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm text-ink/60">{label}</span>
            <span className="text-sm font-medium text-ink">{value}</span>
          </div>
        ))}
      </div>
      <img className = "profile-bg ml-20 h-88 w-60" src = {profilebg} alt="Profile background" />
      </div>
    </div>
  );
}
