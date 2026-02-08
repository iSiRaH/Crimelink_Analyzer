import { useState, type FormEvent } from "react";
import Logo from "../assets/CLA.png";
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
    <div className="login-window">
      <form className="login-container" onSubmit={handleSubmit}>
        <h1 className="login-title">Crime Link Analyzer</h1>
        <p className="login-description">
          Crime Investigation Data Intelligence System
        </p>
        <img src={Logo} alt="Crime Link Analyzer Logo" className="login-logo" />
        <h2 className="login-text">Login to your account</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <label className="input-label">E mail</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="input-field"
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
          <label htmlFor="rememberMe" className="rememberMe-txt">
            Remember me
          </label>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "LOGIN"}
        </button>

        <a href="#" className="forget-password">
          Forgot Password
        </a>

        <p className="bottom-text">
          Access to this system is restricted to authorized personnel of the Sri
          Lanka Crime Division only
        </p>
      </form>
    </div>
  );
}

export default Login;
