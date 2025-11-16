import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Topbar from "./components/Topbar";
import TestPage from "./pages/TestPage";
import AdminDashboard from "./pages/AdminDashboard";
import OICDashboard from "./pages/OICDashboard";
import InvestigatorDashboard from "./pages/InvestigatorDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { setUnauthorizedCallback } from "./services/api";

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the unauthorized callback to use React Router navigation
    setUnauthorizedCallback(() => {
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<TestPage />} />
      
      {/* Protected dashboard routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/oic/dashboard"
        element={
          <ProtectedRoute allowedRoles={['OIC']}>
            <OICDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investigator/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Investigator']}>
            <InvestigatorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Original protected route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div>
              <Topbar />
              <Sidebar />
            </div>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
