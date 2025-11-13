import Logo from "../assets/logo.png";
import "../styles/login.css";

function Login() {
  return (
    <>
      <div className="login-container">
        <h1 className="login-title">Crime Link Analyzer</h1>
        <p className="login-description">Crime Investigation Data Intelligent System</p>
        <img src={Logo} alt="Logo" className="login-logo" />
        <input type="text" placeholder="Username" className="input-username" />
        <input type="password" placeholder="Password" className="input-password" />
        <div>
          <input type="checkbox" id="rememberMe" className="chkbox-rememberMe" />
          <label className="rememberMe-txt"> Remember Me</label>
        </div>
        <button className="login-btn">Login</button>
        <a href="#" className="forget-password">Forgot Password?</a>
        <p className="bottom-text">
          Access to this System is restricted to authorized personnel of Sri
          Lanka Crime Division only.
        </p>
      </div>
    </>
  );
}

export default Login;
