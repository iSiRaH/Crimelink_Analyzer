import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Topbar from "./components/Topbar";

function App() {
  return (
    <>
      <div>
        <Login />
        <Topbar />
        <Sidebar />
      </div>
    </>
  );
}

export default App;
