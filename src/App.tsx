import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Topbar from "./components/Topbar";
import TestPage from "./pages/TestPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/" element={
          <div>
            <Topbar />
            <Sidebar />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
