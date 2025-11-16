import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Topbar from "./components/Topbar";
import TestPage from "./pages/TestPage";
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
      <Route path="/" element={<></>} />
        
      
    </Routes>
  );
}

function App() {
  return (
    <>
      <div>
        <Login />
        <Topbar />
        <Sidebar />
      </div>
      <Router>
        <AppContent />
      </Router>
    </>
    
  );
}

export default App;
