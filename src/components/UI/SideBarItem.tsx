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
          `flex flex-row py-2 px-2 items-center w-full rounded-md cursor-pointer ${
            isActive ? "bg-[#f61010]" : "hover:bg-[#1e2a3d]"
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
