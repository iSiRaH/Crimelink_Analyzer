import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../contexts/useAuth";
import { FaChartBar } from "react-icons/fa6";
import { MdWifiCalling3 } from "react-icons/md";
import { FaMapLocationDot } from "react-icons/fa6";
import { ScanSearch } from "lucide-react";

function Investigator() {
  const { user, logout } = useAuth();

  const menuItems = [
    {name:"Dashboard", icon: FaChartBar, path:"dashboard"},
    {name:"Call Analysis", icon: MdWifiCalling3, path:"call-analysis"},
    {name:"Facial Recognition", icon: ScanSearch, path:"facial-recognition"},
    {name:"Safety Zone", icon: FaMapLocationDot, path:"safety-zone"},
  ];

  return (
    <>
      <div className="flex flex-col h-screen">
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

export default Investigator;
