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
import OICDashboard from "./pages/OIC/OICDashboard";
import ManageProfiles from "./pages/OIC/ManageProfiles";
import InvestigatorDashboard from "./pages/Investigator/InvestigatorDashboard";
import CallAnalysis from "./pages/Investigator/CallAnalysis";
import FacialRecognition from "./pages/Investigator/FacialRecognition";
import Notes from "./pages/Investigator/Notes";
import AdminDashboard from "./pages/Admin/AdminDashboard";

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
      <Route path="/login" element={<Login />} />
      <Route path="/test" element={<TestPage />} />

      {/* Protected dashboard routes */}

      {/* Admin page routing */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Admin />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
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
        <Route path="weapon-handover" element={<WeaponHandover />} />
        <Route path="plate-registry" element={<PlateRegistry />} />
        <Route path="manage-profiles" element={<ManageProfiles />} />
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
        <Route path="notes" element={<Notes />} />
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
