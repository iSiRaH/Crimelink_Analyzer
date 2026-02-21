import type React from "react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  path: string;
  collapsed?: boolean;
}

function SidebarItem({
  icon: Icon,
  name,
  path,
  collapsed = false,
}: SidebarItemProps) {
  return (
    <>
      <NavLink
        to={path}
        end
        title={collapsed ? name : undefined}
        className={({ isActive }) =>
          `flex items-center py-3 rounded-lg cursor-pointer text-[17px] transition-colors duration-200 ${
            collapsed ? "justify-center px-3" : "gap-3 px-4"
          } ${
            isActive
              ? "bg-gradient-to-r from-[#0b0c1a] to-[#161926] text-[#22c55e] font-bold"
              : "hover:bg-white/5 text-white"
          }`
        }
      >
        <Icon size={20} />
        {!collapsed && <span className="text-lg px-2 truncate">{name}</span>}
      </NavLink>
    </>
  );
}

export default SidebarItem;
