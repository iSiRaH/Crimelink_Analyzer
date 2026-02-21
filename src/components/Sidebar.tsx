import React, { useState } from "react";
import SidebarItem from "./UI/SideBarItem";
import { FaSignOutAlt } from "react-icons/fa";
import {
  TbLayoutSidebarLeftExpand,
  TbLayoutSidebarRightExpand,
} from "react-icons/tb";

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
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(true);

  return (
    <>
      {!isMobileOpen && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="absolute left-3 top-3 z-50 rounded-lg border border-dark-border bg-dark-panel/90 p-2 text-white shadow-lg backdrop-blur-sm lg:hidden"
          title="Open sidebar"
          aria-label="Open sidebar"
        >
          <TbLayoutSidebarLeftExpand size={24} />
        </button>
      )}

      <aside
        className={`
              absolute inset-y-0 left-0 z-40 h-full bg-dark-secondary rounded-r-[28px] border border-dark-border shadow-2xl p-4 flex flex-col gap-3
              transform transition-all duration-300 ease-in-out
              ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
              lg:translate-x-0 lg:rounded-[28px] lg:relative lg:inset-auto lg:shrink-0
              ${isDesktopCollapsed ? "lg:w-24" : "lg:w-[320px]"}
            `}
      >
        <div className="flex items-center justify-between pb-2">
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="rounded-md p-2 text-white hover:bg-white/10 lg:hidden"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <TbLayoutSidebarRightExpand size={24} />
          </button>

          <button
            type="button"
            onClick={() => setIsDesktopCollapsed((prev) => !prev)}
            className="hidden lg:flex rounded-md p-2 text-white hover:bg-white/10"
            title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={
              isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            {isDesktopCollapsed ? (
              <TbLayoutSidebarLeftExpand size={24} />
            ) : (
              <TbLayoutSidebarRightExpand size={24} />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1">
          {items.map((item, index) => (
            <SidebarItem
              key={index}
              name={item.name}
              icon={item.icon}
              path={item.path}
              collapsed={isDesktopCollapsed}
            />
          ))}
        </div>

        <button
          className={`cursor-pointer text-red-primary font-bold text-lg hover:bg-white/5 rounded-lg transition-colors duration-200 ${
            isDesktopCollapsed
              ? "flex items-center justify-center p-3"
              : "flex items-center gap-3 px-4 py-3"
          }`}
          onClick={logoutFunc}
          title={isDesktopCollapsed ? "Log Out" : undefined}
        >
          <FaSignOutAlt className="w-5 h-5" />
          {!isDesktopCollapsed && "Log Out"}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
