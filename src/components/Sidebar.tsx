import React from "react";
import SidebarItem from "./UI/SideBarItem";
import { FaSignOutAlt } from "react-icons/fa";

type MenuItem = {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
};

interface SideBarProps {
  items: MenuItem[];
  logoutFunc: ()=>void;
}

const Sidebar: React.FC<SideBarProps> = ({items, logoutFunc}) => {
  return (
    <div className="h-full w-64 bg-[#141c2c] text-white flex flex-col gap-3 justify-start items-start p-5">
      {items.map((item, index) => (
        <SidebarItem key={index} name={item.name} icon={item.icon} />
      ))}

      <button className="bg-[#c13f46] w-full py-2 mt-8 text-lg font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-[#a83238] transition" onClick={logoutFunc}>
        <FaSignOutAlt /> Log Out
      </button>
    </div>
  );
};

export default Sidebar;
