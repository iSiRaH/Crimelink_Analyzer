import "../styles/login.css";

function Login() {
  return (
    <>
      <div className="test">
        <h1 className="pb-4 text-blue-500">Login form</h1>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
      </div>
    </>
  );
}

export default Login;
