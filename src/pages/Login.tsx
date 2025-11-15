import { User, LockKeyhole } from "lucide-react";
import Logo from "../assets/logo.png";
import bgImage from "../assets/bgImage.png";
import "../styles/login.css";

function Login() {
  return (
    <>
      <div
        className="login-window"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="login-container">
          <h1 className="login-title">Crime Link Analyzer</h1>
          <p className="login-description">
            Crime Investigation Data Intelligent System
          </p>
          <h2 className="login-text">Login to your Acoount</h2>
          <img src={Logo} alt="Logo" className="login-logo" />
          <div className="input-wrapper">
            <User className="input-icon" />
            <input
              type="text"
              placeholder="Username"
              className="input-username"
            />
          </div>
          <div className="input-wrapper">
            <LockKeyhole className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              className="input-password"
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
          <button className="login-btn">Login</button>
          <a href="#" className="forget-password">
            Forgot Password?
          </a>
          <p className="bottom-text">
            Access to this System is restricted to authorized personnel of Sri
            Lanka Crime Division only.
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
