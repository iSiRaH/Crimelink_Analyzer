import React from "react";
import {
  FaChartBar,
  FaUserFriends,
  FaUserShield,
  FaStickyNote,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  return (
    <div className="h-screen w-64 bg-[#141c2c] text-white flex flex-col justify-between p-3">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-4 py-2 hover:bg-[#1e2a3d] rounded-md cursor-pointer">
          <FaChartBar size={20} />
          <span className="text-lg">Dashboard</span>
        </div>

        <div className="flex items-center space-x-3 px-4 py-2 hover:bg-[#1e2a3d] rounded-md cursor-pointer">
          <FaUserFriends size={20} />
          <span className="text-lg font-medium">Duty management</span>
        </div>

        <div className="flex items-center space-x-3 px-4 py-2 hover:bg-[#1e2a3d] rounded-md cursor-pointer">
          <FaUserShield size={20} />
          <span className="text-lg">Weapon handover</span>
        </div>

        <div className="flex items-center space-x-3 px-4 py-2 hover:bg-[#1e2a3d] rounded-md cursor-pointer">
          <FaStickyNote size={20} />
          <span className="text-lg">Notes</span>
        </div>

        <div className="px-4 text-lg mt-6">Notes</div>
      </div>

      <div className="p-3">
        <button className="w-full bg-[#c13f46] py-2 text-lg font-semibold rounded-full flex items-center justify-center gap-2 hover:bg-[#a83238] transition">
          <FaSignOutAlt /> Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
