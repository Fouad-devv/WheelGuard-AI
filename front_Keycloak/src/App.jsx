import { Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { useRole } from './hooks/useRole';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Public }          from './pages/public/public';
import { Dashboard }       from './pages/Dashboard';
import { Prediction }      from './pages/Prediction';
import { History }         from './pages/History';
import { BatchPrediction } from './pages/BatchPrediction';
import { Users }           from './pages/admin/Users';
import { AuditLogs }       from './pages/admin/AuditLogs';

const AdminRoute = ({ children }) => {
  const { isAdmin, isManager } = useRole();
  if (!isAdmin && !isManager) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-500 text-sm">Initialisation…</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/"  element={keycloak.authenticated ? <Navigate to="/dashboard" replace /> : <Public />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/prediction" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />
      <Route path="/history"    element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/batch"      element={<ProtectedRoute><BatchPrediction /></ProtectedRoute>} />

      <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><Users /></AdminRoute></ProtectedRoute>} />
      <Route path="/admin/audit" element={<ProtectedRoute><AdminRoute><AuditLogs /></AdminRoute></ProtectedRoute>} />

      {/* Legacy redirect */}
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="*"     element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
