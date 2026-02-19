import type React from "react";
import { NavLink } from "react-router-dom";

interface SidebarItemProps {
  name: string;
  icon: React.ComponentType<{ size?: number }>;
  path: string;
}

function SidebarItem({ icon: Icon, name, path }: SidebarItemProps) {
  return (
    <>
      <NavLink
        to={path}
        end
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-[17px] transition-colors duration-200 ${
            isActive
              ? "bg-gradient-to-r from-[#0b0c1a] to-[#161926] text-[#22c55e] font-bold"
              : "hover:bg-white/5 text-white"
          }`
        }
      >
        <Icon size={20} />
        <span className="text-lg px-4">{name}</span>
      </NavLink>
    </>
  );
}

export default SidebarItem;
