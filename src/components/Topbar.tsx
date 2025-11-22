import React from "react";
import ProfilePic from "../assets/profile_pic.png";
import Logo from "../assets/logo.png";

const Topbar: React.FC<{ name: string, role: string }> = ({ name, role }) => {
  return (
    <div className="w-full py-3 px-6 bg-[#0f172a] text-white flex items-center justify-between border-b border-gray-700">

      
      <div className="flex items-center space-x-3">
        <img
          src={Logo} 
          alt="Logo"
          className="h-12"
        />

        <h1 className="text-2xl font-bold tracking-wide pl-3">
          CRIME LINK ANALYZER
        </h1>
      </div>

      
      <div className="flex items-center space-x-4">
        <span className="text-lg font-medium px-3">{name}</span>

        <span className="text-lg font-medium px-3">{role}</span>

        <img src={ProfilePic} alt="Profile_picture" className="h-10"/>
      </div>

    </div>
  );
};

export default Topbar;
