import {
  FaChartBar,
  FaUserFriends,
  FaUserShield,
  FaStickyNote,
  FaFileAlt,
} from "react-icons/fa";
import { FaUserGear } from "react-icons/fa6";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../contexts/useAuth";
import { Outlet } from "react-router-dom";
import { MdOutlineBugReport } from "react-icons/md";

function OIC() {
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", icon: FaChartBar, path: "dashboard" },
    {
      name: "Duty management",
      icon: FaUserFriends,
      path: "duty-management",
    },
    {
      name: "Weapon handover",
      icon: FaUserShield,
      path: "weapon-handover",
    },
    { name: "Plate Registry", icon: FaStickyNote, path: "plate-registry" },
    { name: "Report", icon: FaFileAlt, path: "report" },
    { name: "Report Crimes", icon: MdOutlineBugReport, path: "report-crimes" },
    { name: "Manage Profiles", icon: FaUserGear, path: "manage-profiles" },
    { name: "Officer Locations", icon: FaUserGear, path: "officer-locations" },
  ];

  return (
    <>
      <div className="flex flex-col h-screen">
        <Topbar
          name={user?.name ?? "Not Defined"}
          role={user?.role ?? "Not defined"}
        />

        <div className="relative flex flex-1 bg-dark-bg overflow-hidden">
          <Sidebar items={menuItems} logoutFunc={logout} />
          <div className="flex-1 p-0 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default OIC;
