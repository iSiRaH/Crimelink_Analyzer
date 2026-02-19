import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../contexts/useAuth";
import Topbar from "../../components/Topbar";
import {
  FaChartBar,
  FaUserCog,
  FaDatabase,
  FaClipboardList,
  FaCog,
  FaFileAlt,
  FaHeartbeat,
} from "react-icons/fa";

function Admin() {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: FaChartBar, path: "dashboard" },
    { name: "User Management", icon: FaUserCog, path: "user-management" },
    { name: "Backup & Restore", icon: FaDatabase, path: "backup-restore" },
    { name: "Audit Logs", icon: FaClipboardList, path: "audit-logs" },
    { name: "System Settings", icon: FaCog, path: "system-settings" },
    { name: "Reports", icon: FaFileAlt, path: "reports" },
    { name: "System Health", icon: FaHeartbeat, path: "system-health" },
  ];

  return (
    <>
      <div className="flex flex-col h-screen bg-dark-bg">
        <Topbar
          name={user?.name ?? "Not Defined"}
          role={user?.role ?? "Not defined"}
        />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar items={menuItems} logoutFunc={logout} />
          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
