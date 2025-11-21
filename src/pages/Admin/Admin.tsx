import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../contexts/useAuth";
import Topbar from "../../components/Topbar";
import { FaChartBar } from "react-icons/fa";

function Admin() {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: FaChartBar, path: "dashboard" },
  ];

  return (
    <>
      <div className="flex flex-col h-screen">
        <Topbar
          name={user?.name ?? "Not Defined"}
          role={user?.role ?? "Not defined"}
        />

        <div className="flex flex-1">
          <Sidebar items={menuItems} logoutFunc={logout} />
          <div className="flex-1 p-0 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
