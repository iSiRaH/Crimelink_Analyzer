import type React from "react";

interface SidebarItemProps{
    name:string;
    icon:React.ComponentType<{size?:number}>;
}

function SidebarItem({icon:Icon, name}:SidebarItemProps) {
  return (
    <>
      <div className="flex flex-row py-2 px-1 items-center hover:bg-[#1e2a3d] w-full rounded-md cursor-pointer">
        <Icon size={20} />
        <span className="text-lg px-4">{name}</span>
      </div>
    </>
  );
}

export default SidebarItem;
