import { useState, type FormEvent } from "react";
import { User, LockKeyhole } from "lucide-react";
import Logo from "../assets/logo.png";
import bgImage from "../assets/bgImage.png";
import { useAuth } from "../contexts/useAuth";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <>
      <div
        className="login-window"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <form className="login-container" onSubmit={handleSubmit}>
          <h1 className="login-title">Crime Link Analyzer</h1>
          <p className="login-description">
            Crime Investigation Data Intelligent System
          </p>
          <h2 className="login-text">Login to your Account</h2>
          <img src={Logo} alt="Logo" className="login-logo" />
          
          {error && (
            <div style={{ 
              color: '#e74c3c', 
              fontSize: '14px', 
              marginBottom: '10px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div className="input-wrapper">
            <User className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              className="input-username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="input-wrapper">
            <LockKeyhole className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              className="input-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="remember-me-container">
            <input
              type="checkbox"
              id="rememberMe"
              className="chkbox-rememberMe"
            />
            <label className="rememberMe-txt"> Remember Me</label>
          </div>
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <a href="#" className="forget-password">
            Forgot Password?
          </a>
          <p className="bottom-text">
            Access to this System is restricted to authorized personnel of Sri
            Lanka Crime Division only.
          </p>
        </form>
      </div>
    </>
  );
}

export default Login;
