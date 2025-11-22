import {
  FaChartBar,
  FaUserFriends,
  FaUserShield,
  FaStickyNote,
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../contexts/useAuth";

function OICDashboard() {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: FaChartBar },
    { name: "Duty management", icon: FaUserFriends },
    { name: "Weapon handover", icon: FaUserShield },
    { name: "Notes", icon: FaStickyNote },
  ];

  return (
    <>
      <Topbar
        name={user?.name ?? "Not Defined"}
        role={user?.role ?? "Not defined"}
      />
      <Sidebar items={menuItems} logoutFunc={logout} />
    </>
  );
}

export default OICDashboard;
