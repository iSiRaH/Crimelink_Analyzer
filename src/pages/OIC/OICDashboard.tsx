import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../contexts/useAuth";

function OICDashboard() {
  const { user, logout } = useAuth();

  return (
    <>
      <Topbar name={user?.name ?? "Not Defined"} role={user?.role ?? "Not defined"}/>
      <Sidebar/>
    </>
  );
}

export default OICDashboard;
