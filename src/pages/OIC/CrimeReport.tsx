import {
  type FunctionComponent,
  useState,
  useRef,
  type DragEvent,
  type ChangeEvent,
} from "react";
import { FaUser, FaCloudUploadAlt, FaTimes, FaBars } from "react-icons/fa";
import { GiPistolGun } from "react-icons/gi";
import { MdDashboard, MdOutlineReport, MdCalendarToday } from "react-icons/md";
import { BiLogOut } from "react-icons/bi";
import { AiOutlineClockCircle } from "react-icons/ai";
import { IoMdArrowDropdown } from "react-icons/io";
import { RiUserSettingsLine } from "react-icons/ri";
import { GiHandcuffs } from "react-icons/gi";

// Crime type options
const crimeTypes = [
  "Theft",
  "Assault",
  "Robbery",
  "Burglary",
  "Vandalism",
  "Fraud",
  "Drug Offense",
  "Domestic Violence",
  "Kidnapping",
  "Homicide",
  "Other",
];

const ReportCrime: FunctionComponent = () => {
  // Form state
  const [crimeType, setCrimeType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentTime, setIncidentTime] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // UI state
  const [activeNav, setActiveNav] = useState("report");
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Handle drag events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  // Remove file
  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!crimeType || !location || !description || !incidentDate) {
      alert(
        "Please fill in all required fields: Crime Type, Location, Description, and Date",
      );
      return;
    }

    const reportData = {
      crimeType,
      location,
      description,
      incidentDate,
      incidentTime,
      attachedFiles: attachedFiles.map((f) => f.name),
      submittedAt: new Date().toISOString(),
    };

    console.log("Crime Report Submitted:", reportData);
    alert(
      `Crime Report Submitted Successfully!\n\nType: ${crimeType}\nLocation: ${location}\nDate: ${incidentDate}\nFiles: ${attachedFiles.length} attached`,
    );

    // Reset form after submission
    handleCancel();
  };

  // Handle cancel/reset
  const handleCancel = () => {
    setCrimeType("");
    setLocation("");
    setDescription("");
    setIncidentDate("");
    setIncidentTime("");
    setAttachedFiles([]);
    setIsDropdownOpen(false);
  };

  // Handle view reports
  const handleViewReports = () => {
    alert(
      "Navigating to View Crime Reports...\n(This feature will be implemented with routing)",
    );
  };

  // Handle navigation
  const handleNavClick = (navId: string) => {
    setActiveNav(navId);
    setSidebarOpen(false);
    if (navId !== "report") {
      alert(`Navigating to ${navId}...\n(Routing will be implemented)`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      alert("Logging out...");
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <MdDashboard className="w-5 h-5" /> },
    { id: "duty", label: "Duty management", icon: <RiUserSettingsLine className="w-5 h-5" /> },
    { id: "weapon", label: "Weapon handover", icon: <GiPistolGun className="w-5 h-5" /> },
    { id: "plate", label: "Plate registry", icon: <MdCalendarToday className="w-5 h-5" /> },
    { id: "report", label: "Report Crimes", icon: <MdOutlineReport className="w-5 h-5" /> },
    { id: "oic", label: "OIC report", icon: <MdOutlineReport className="w-5 h-5" /> },
    { id: "profile", label: "Manage Profile", icon: <RiUserSettingsLine className="w-5 h-5" /> },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0b0c1a] text-white font-['Inter',sans-serif] overflow-x-hidden flex flex-col">
      {/* ── Header ── */}
      <header className="mx-4 mt-4 sm:mx-6 rounded-[41px] bg-[#181d30] flex items-center justify-between px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            className="lg:hidden text-white p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars className="w-5 h-5" />
          </button>
          <GiHandcuffs size={36} color="#7c3aed" className="shrink-0" />
          <b className="text-lg sm:text-2xl whitespace-nowrap">CRIME LINK ANALYZER</b>
        </div>
        <div className="flex items-center gap-3">
          <b className="hidden sm:inline text-sm lg:text-lg">Jineth Bosilu</b>
          <b className="hidden md:inline text-base lg:text-xl">OIC</b>
          <FaUser className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
        </div>
      </header>

      {/* ── Body (sidebar + main) ── */}
      <div className="flex flex-1 mt-4 px-4 sm:px-6 pb-6 gap-4 relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <aside
          className={`
            fixed top-0 left-0 h-full w-[260px] bg-[#181d30] rounded-r-[40px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] z-40 p-6 pt-20 flex flex-col gap-1 transition-transform duration-300
            lg:static lg:h-auto lg:rounded-[40px] lg:translate-x-0 lg:z-0 lg:shrink-0 lg:min-h-[600px]
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-[17px] transition-colors duration-200
                ${activeNav === item.id
                  ? "bg-gradient-to-r from-[#0b0c1a] to-[#161926] text-[#22c55e] font-bold"
                  : "hover:bg-white/5"
                }`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}

          <div className="mt-auto pt-6">
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer text-[#ff0000] font-bold text-lg hover:bg-white/5 rounded-lg transition-colors duration-200"
              onClick={handleLogout}
            >
              <BiLogOut className="w-5 h-5" />
              <span>Logout</span>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <b className="text-2xl sm:text-[28px]">Report Crime</b>
            <button
              className="rounded-md bg-[#22c55e] px-5 py-2 text-sm font-bold hover:bg-[#16a34a] transition-colors duration-200 self-start sm:self-auto"
              onClick={handleViewReports}
            >
              View Crime Reports
            </button>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* ── Crime Details Card ── */}
            <div className="bg-[#181d30] rounded-[40px] sm:rounded-[54px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6 sm:p-8 flex flex-col gap-5">
              <b className="text-2xl sm:text-[28px]">Crime Details</b>

              {/* Crime Type */}
              <div className="flex flex-col gap-2">
                <span className="text-lg sm:text-xl">Crime Type</span>
                <div className="relative">
                  <div
                    className="rounded-[13px] bg-white h-[40px] flex items-center px-4 cursor-pointer justify-between"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="text-[rgba(11,12,26,0.5)] text-sm">
                      {crimeType || "Select a type"}
                    </span>
                    <IoMdArrowDropdown className="w-6 h-6 text-[#0b0c1a]" />
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute top-[44px] left-0 w-full max-h-[250px] overflow-y-auto bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.3)] z-[1000]">
                      {crimeTypes.map((type) => (
                        <div
                          key={type}
                          className="py-3 px-4 text-[#0b0c1a] cursor-pointer text-sm transition-colors duration-200 hover:bg-[#e0e0e0]"
                          onClick={() => {
                            setCrimeType(type);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2">
                <span className="text-lg sm:text-xl">Location</span>
                <input
                  type="text"
                  className="rounded-[13px] bg-white h-[40px] px-4 text-[#0b0c1a] text-sm font-['Inter',sans-serif] outline-none placeholder:text-[rgba(11,12,26,0.5)]"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Date & Time */}
              <div className="flex flex-col gap-2">
                <span className="text-lg sm:text-xl">{`Date & Time Incident`}</span>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      className="rounded-[13px] bg-white h-[40px] px-4 w-full text-[#0b0c1a] text-sm font-['Inter',sans-serif] outline-none"
                      value={incidentDate}
                      onChange={(e) => setIncidentDate(e.target.value)}
                    />
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="time"
                      className="rounded-[13px] bg-white h-[40px] px-4 w-full text-[#0b0c1a] text-sm font-['Inter',sans-serif] outline-none"
                      value={incidentTime}
                      onChange={(e) => setIncidentTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <span className="text-lg sm:text-xl">Description</span>
                <textarea
                  className="rounded-[13px] bg-white min-h-[53px] px-4 py-3 text-[#0b0c1a] text-sm font-['Inter',sans-serif] outline-none resize-none placeholder:text-[rgba(11,12,26,0.5)]"
                  placeholder="Enter crime description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* ── Evidence & Actions Card ── */}
            <div className="bg-[#181d30] rounded-[40px] sm:rounded-[54px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6 sm:p-8 flex flex-col gap-5">
              <b className="text-2xl sm:text-[28px]">{`Evidence & Actions`}</b>

              {/* Drag & Drop Area */}
              <div
                className={`rounded-[13px] border border-dashed border-white/50 min-h-[180px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors duration-200
                  ${isDragActive ? "border-2 border-[#22c55e] bg-[rgba(34,197,94,0.1)]" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FaCloudUploadAlt className="w-16 h-16 sm:w-[75px] sm:h-[75px] text-white/70" />
                <span className="text-white/50 text-sm">
                  {isDragActive ? "Drop files here!" : "Drag & Drop files here"}
                </span>
              </div>

              {/* Upload Evidence Button */}
              <button
                className="rounded-md bg-[#22c55e] px-5 py-2 text-sm font-bold hover:bg-[#16a34a] transition-colors duration-200 self-end"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Evidence
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
              />

              {/* Attached Files */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-lg sm:text-xl">Attached Files</span>
                  <div className="max-h-[180px] overflow-y-auto flex flex-col gap-1.5">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 px-3 bg-[rgba(34,197,94,0.15)] rounded-md border border-[rgba(34,197,94,0.3)]"
                      >
                        <span className="text-white text-[13px] overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex-1 mr-2">
                          {file.name}
                        </span>
                        <FaTimes
                          className="text-[#f97316] cursor-pointer text-sm shrink-0 transition-colors duration-200 hover:text-[#ef4444]"
                          onClick={() => handleRemoveFile(index)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-2">
            <button
              className="rounded-md bg-[#f97316] px-8 py-2.5 font-bold hover:bg-[#ea580c] transition-colors duration-200"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-[#3b82f6] px-8 py-2.5 font-bold hover:bg-[#2563eb] transition-colors duration-200"
              onClick={handleSubmit}
            >
              Submit Report
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportCrime;
