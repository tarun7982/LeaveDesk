import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import PendingApprovals from './pages/PendingApprovals';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function withLayout(element) {
  return <Layout>{element}</Layout>;
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={<ProtectedRoute>{withLayout(<Dashboard />)}</ProtectedRoute>}
          />
          <Route
            path="/apply-leave"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>{withLayout(<ApplyLeave />)}</ProtectedRoute>
            }
          />
          <Route
            path="/leave-history"
            element={<ProtectedRoute>{withLayout(<LeaveHistory />)}</ProtectedRoute>}
          />
          <Route
            path="/pending-approvals"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>{withLayout(<PendingApprovals />)}</ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={<ProtectedRoute>{withLayout(<Profile />)}</ProtectedRoute>}
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
