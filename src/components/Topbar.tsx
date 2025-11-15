import React from "react";
import { FaUserCircle } from "react-icons/fa";

const Topbar: React.FC = () => {
  return (
    <div className="w-screen h-16 bg-[#0f172a] text-white flex items-center justify-between px-6 border-b border-gray-700">

      
      <div className="flex items-center space-x-3">
        <img
          src="/logo.png"   
          alt="Logo"
          className="h-10 w-10"
        />

        <h1 className="text-xl font-bold tracking-wide">
          CRIME LINK ANALYZER
        </h1>
      </div>

      
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">oico001</span>

        <FaUserCircle className="text-3xl" />

        <span className="text-sm font-medium">Admin</span>
      </div>

    </div>
  );
};

export default Topbar;
