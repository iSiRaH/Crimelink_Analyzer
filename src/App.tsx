import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login";
import TestPage from "./pages/TestPage";
import { setUnauthorizedCallback } from "./services/api";
import DutyManagement from "./pages/DutyManagement";

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
      <Route path="/" element={<DutyManagement />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
