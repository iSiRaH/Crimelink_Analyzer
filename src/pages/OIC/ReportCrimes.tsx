import { saveCrimeReports } from "../../api/crimeReportService";
import type { crimeReportType } from "../../types/crime";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import MapPopup from "../../components/UI/MapPopup";
import { NavLink } from "react-router-dom";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";

function ReportCrimes() {
  const [crimetype, setCrimeType] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [isMapOpen, setIsMapOpen] = useState(false);

  const validateForm = () => {
    if (crimetype === "" || !crimetype) {
      alert("Please select a crime type");
      return false;
    }
    if (!location || location === "") {
      alert("Please select a location");
      return false;
    }
    if (!latitude || latitude === "") {
      alert("Please select a latitude");
      return false;
    }
    if (!longitude || longitude === "") {
      alert("Please select a longitude");
      return false;
    }
    if (!date || date === "") {
      alert("Please select a date");
      return false;
    }
    if (!time || time === "") {
      alert("Please select a time");
      return false;
    }
    if (!description || description === "") {
      alert("Please enter a description");
      return false;
    }
    return true;
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

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

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setCrimeType("");
    setLocation("");
    setLatitude("");
    setLongitude("");
    setDate("");
    setTime("");
    setDescription("");
  };

  const handleClear = () => {
    setLocation("");
    setLatitude("");
    setLongitude("");
  };

  // on submit btn click
  const onSubmit = async () => {
    if (!validateForm()) return;
    try {
      console.log("Submit Report Clicked");
      const report: crimeReportType = {
        crimeType: crimetype,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description: description,
        dateReported: date,
        timeReported: time,
      };
      const res = await saveCrimeReports(report);
      console.log("Crime Report Saved \n ", res);
      alert("Crime Report Saved Successfully");
      resetForm();
    } catch (e) {
      console.log(e);
      alert("Failed to save report");
    }
  };

  const spawnMap = () => {
    setIsMapOpen(true);
  };

  const onMapClick = (location: { latitude: number; longitude: number }) => {
    // setIsMapOpen(false);
    setLatitude(location.latitude.toString());
    setLongitude(location.longitude.toString());
    setLocation(`${location.latitude}, ${location.longitude}`);
  };

  const onMapSubmit = () => {
    setIsMapOpen(false);
  };

  const onCancel = () => {
    console.log("Cancel Clicked");
    resetForm();
  };

  return (
    <>
      <div className="w-full min-h-screen bg-[#0b0c1a] text-white font-['Inter',sans-serif] overflow-x-hidden flex flex-col">
        <div className="bg-slate-800 p-5 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="font-semibold text-3xl text-white sm:text-[28px] mb-5 pl-4">
              Report Crimes
            </h1>
            <NavLink to={"reports"}>
              <button className="rounded-md bg-[#22c55e] px-5 py-2 text-sm font-bold hover:bg-[#16a34a] transition-colors duration-200 self-start sm:self-auto">
                View Crime Reports
              </button>
            </NavLink>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-[#181d30] rounded-[40px] sm:rounded-[54px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6 sm:p-8 flex flex-col gap-5">
              <h2 className="font-medium text-2xl sm:text-[28px]">
                Crime Details
              </h2>
              <p className="text-lg sm:text-xl">Crime Type</p>
              <select
                title="crime_type"
                value={crimetype}
                onChange={(e) => {
                  setCrimeType(e.target.value);
                }}
                className="rounded-[13px] bg-white h-[40px] px-4 text-[#0b0c1a] text-sm font-['Inter',sans-serif] outline-none placeholder:text-[rgba(11,12,26,0.5)]"
              >
                <option value="" disabled hidden>
                  Select a Type
                </option>
                <option value="THEFT">Theft</option>
                <option value="ASSAULT">Assault</option>
                <option value="BURGLARY">Burglary</option>
                <option value="ROBBERY">Robbery</option>
                <option value="VANDALISM">Vandalism</option>
                <option value="DRUG_OFFENSE">Drug Offense</option>
                <option value="TRAFFIC_VIOLATION">Traffic Violation</option>
                <option value="HOMICIDE">Homicide</option>
                <option value="FRAUD">Fraud</option>
                <option value="ARSON">Arson</option>
              </select>
              <p className="text-lg sm:text-xl">Location</p>
              <input
                type="text"
                className="rounded-[13px] bg-white h-[40px] px-4 text-[#0b0c1a] text-sm font-['Inter',sans-serif] outline-none placeholder:text-[rgba(11,12,26,0.5)]"
                placeholder="Click to add location"
                value={location}
                readOnly
                onClick={spawnMap}
              />
              <p className="text-lg sm:text-xl">Date & Time of Incident</p>
              <div className="w-full flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  className="rounded-[13px] bg-white h-[40px] px-4 w-full text-[#0b0c1a] text-sm font-['Inter',sans-serif] outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-[13px] bg-white h-[40px] px-4 w-full text-[#0b0c1a] text-sm font-['Inter',sans-serif] outline-none"
                />
              </div>
              <p className="text-lg sm:text-xl">Description</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-[13px] bg-white min-h-[53px] px-4 py-3 text-[#0b0c1a] text-sm font-['Inter',sans-serif] outline-none resize-none placeholder:text-[rgba(11,12,26,0.5)]"
                placeholder="Enter crime description..."
                rows={3}
              />
            </div>
            <div className="bg-[#181d30] rounded-[40px] sm:rounded-[54px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-6 sm:p-8 flex flex-col gap-5">
              <h2 className="font-medium text-2xl sm:text-[28px] mb-3">
                Evidance & Actions
              </h2>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-[13px] border border-dashed border-white/50 min-h-[180px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors duration-200
                  ${isDragActive ? "border-2 border-[#22c55e] bg-[rgba(34,197,94,0.1)]" : ""}`}
              >
                <FaCloudUploadAlt className="w-16 h-16 sm:w-[75px] sm:h-[75px] text-white/70" />
                <span className="text-white/50 text-sm">
                  {isDragActive ? "Drop files here!" : "Drag & Drop files here"}
                </span>
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
              </div>
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
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4">
            <button
              onClick={onSubmit}
              className="rounded-md bg-[#3b82f6] px-8 py-2.5 font-bold hover:bg-[#2563eb] transition-colors duration-200"
            >
              Submit Report
            </button>
            <button
              onClick={onCancel}
              className="rounded-md bg-[#f97316] px-8 py-2.5 font-bold hover:bg-[#ea580c] transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Map popup */}
      <MapPopup
        open={isMapOpen}
        onClose={onMapSubmit}
        onLocationSelect={onMapClick}
        onClear={handleClear}
      />
    </>
  );
}

export default ReportCrimes;
