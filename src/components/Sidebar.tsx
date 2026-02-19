import React, { useState } from "react";
import SidebarItem from "./UI/SideBarItem";
import { FaSignOutAlt } from "react-icons/fa";

type MenuItem = {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  path: string;
};

interface SideBarProps {
  items: MenuItem[];
  logoutFunc: () => void;
}

const Sidebar: React.FC<SideBarProps> = ({ items, logoutFunc }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <aside
      className={`
            fixed top-0 left-0 h-full w-[300px] bg-[#181d30] rounded-r-[40px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] z-40 p-6 pt-20 flex flex-col gap-1 transition-transform duration-300
            lg:static lg:h-auto lg:rounded-[40px] lg:translate-x-0 lg:z-0 lg:shrink-0 lg:min-h-[600px]
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
    >
      {items.map((item, index) => (
        <SidebarItem
          key={index}
          name={item.name}
          icon={item.icon}
          path={item.path}
        />
      ))}

      <button
        className="flex items-center gap-3 px-4 py-3 cursor-pointer text-[#ff0000] font-bold text-lg hover:bg-white/5 rounded-lg transition-colors duration-200"
        onClick={logoutFunc}
      >
        <FaSignOutAlt className="w-5 h-5" /> Log Out
      </button>
    </aside>
  );
};

export default Sidebar;
