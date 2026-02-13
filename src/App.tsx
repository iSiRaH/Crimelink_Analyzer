import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import TestPage from "./pages/TestPage";
import Admin from "./pages/Admin/Admin";
import OIC from "./pages/OIC/OIC";
import Investigator from "./pages/Investigator/Investigator";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { setUnauthorizedCallback } from "./services/api";
import DutyManagement from "./pages/OIC/DutyManagement";
import WeaponHandover from "./pages/OIC/WeaponHandover";
import PlateRegistry from "./pages/OIC/PlateRegistry";
import OICReport from "./pages/OIC/OICReport";
import OICDashboard from "./pages/OIC/OICDashboard";
import ManageProfiles from "./pages/OIC/ManageProfiles";
import InvestigatorDashboard from "./pages/Investigator/InvestigatorDashboard";
import CallAnalysis from "./pages/Investigator/CallAnalysis";
import FacialRecognition from "./pages/Investigator/FacialRecognition";
import SafetyZone from "./pages/Investigator/SafetyZone";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import UserManagement from "./pages/Admin/UserManagement";
import BackupRestore from "./pages/Admin/BackupRestore";
import AuditLogs from "./pages/Admin/AuditLogs";
import SystemSettings from "./pages/Admin/SystemSettings";
import Reports from "./pages/Admin/Reports";
import SystemHealth from "./pages/Admin/SystemHealth";
import NotFound from "./pages/NotFound";
import { MapProvider } from "./contexts/MapContext";
import ReportCrimes from "./pages/OIC/ReportCrimes";
import ViewCrimeReports from "./pages/OIC/ViewCrimeReports";
import LeaveManagement from "./pages/OIC/LeaveManagment";
import OfficerLocationView from "./pages/OIC/OfficerLocationView";

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the unauthorized callback to use React Router navigation
    setUnauthorizedCallback(() => {
      navigate("/login", { replace: true });
    });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<TestPage />} />

      {/* Protected dashboard routes */}

      {/* Admin page routing */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Admin />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="user-management" element={<UserManagement />} />
        <Route path="backup-restore" element={<BackupRestore />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="system-settings" element={<SystemSettings />} />
        <Route path="reports" element={<Reports />} />
        <Route path="system-health" element={<SystemHealth />} />
      </Route>

      {/* OIC page routing */}
      <Route
        path="/oic"
        element={
          <ProtectedRoute allowedRoles={["OIC"]}>
            <OIC />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OICDashboard />} />
        <Route path="duty-management" element={<DutyManagement />} />
        <Route path="leave-management" element={<LeaveManagement />} />
        <Route path="weapon-handover" element={<WeaponHandover />} />
        <Route path="plate-registry" element={<PlateRegistry />} />
        <Route path="report" element={<OICReport />} />
        <Route path="report-crimes" element={<ReportCrimes />} />
        <Route path="report-crimes/reports" element={<ViewCrimeReports />} />
        <Route path="manage-profiles" element={<ManageProfiles />} />
        <Route path="officer-locations" element={<OfficerLocationView />} />
      </Route>

      {/* investigator page routing */}
      <Route
        path="/investigator"
        element={
          <ProtectedRoute allowedRoles={["Investigator"]}>
            <Investigator />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<InvestigatorDashboard />} />
        <Route path="call-analysis" element={<CallAnalysis />} />
        <Route path="facial-recognition" element={<FacialRecognition />} />
        <Route path="safety-zone" element={<SafetyZone />} />
      </Route>

      {/* Original protected route */}
      {/* <Route
        path="/"
        element={
          <ProtectedRoute>
            <div>
              <OICDashboard />
            </div>
          </ProtectedRoute>
        }
      /> */}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MapProvider>
          <AppContent />
        </MapProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
