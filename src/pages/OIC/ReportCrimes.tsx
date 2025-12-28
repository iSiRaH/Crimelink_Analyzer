import { CloudUpload } from "lucide-react";
import { saveCrimeReports } from "../../api/crimeReportService";
import type { crimeReportType } from "../../types/crime";
import { useState } from "react";
import MapPopup from "../../components/UI/MapPopup";

function ReportCrimes() {
  const [crimetype, setCrimeType] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

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
      <div className="bg-slate-500 w-full h-full p-6">
        <div className="bg-slate-800 p-5 rounded-lg">
          <h1 className="font-semibold text-3xl text-white mb-5 pl-4">
            Report Crimes
          </h1>
          <div className="flex flex-row justify-between">
            <div className="flex-1 bg-white mr-2 space-y-2 p-4 rounded-md">
              <h2 className="font-medium text-2xl">Crime Details</h2>
              <p className="text-base font-medium">Crime Type</p>
              <select
                title="crime_type"
                value={crimetype}
                onChange={(e) => {
                  setCrimeType(e.target.value);
                }}
                className="w-full border-slate-300 border-[1px] rounded-sm py-2 pl-1"
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
              <p className="text-base font-medium">Location</p>
              <input
                type="text"
                className="w-full border-slate-300 border-[1px] rounded-sm py-2 pl-1"
                value={location}
                readOnly
                onClick={spawnMap}
              />
              <p className="text-base font-medium">Date & Time of Incident</p>
              <div className="w-full">
                <input
                  type="date"
                  className=" border-slate-300 border-[1px] rounded-sm py-2 px-1"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className=" border-slate-300 border-[1px] rounded-sm ml-4 py-2 px-1"
                />
              </div>
              <p className="text-base font-medium">Description</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-slate-300 border-[1px] rounded-sm p-2"
              />
            </div>
            <div className="flex-1 bg-white ml-2 p-4 rounded-md">
              <h2 className="font-medium text-2xl mb-3">Evidance & Actions</h2>
              <div className="flex flex-col justify-center items-center gap-2 p-5 border-2 border-dashed mb-3">
                <CloudUpload size={60} color="#94A3B8" />
                <p className="text-slate-400">Drag and Drop files here, or</p>
                <button className="bg-slate-700 py-2 px-4 rounded-md text-white hover:bg-slate-500 hover:text-black">
                  Upload Evidence
                </button>
              </div>
              <p className="text-base font-medium mb-3">Attached Files</p>
            </div>
          </div>
          <div className="pl-4 mt-4 flex gap-3">
            <button
              onClick={onSubmit}
              className="py-2 px-4 rounded-md bg-white hover:bg-slate-300"
            >
              Submit Report
            </button>
            <button
              onClick={onCancel}
              className="py-2 px-4 rounded-md bg-slate-500 hover:bg-slate-600"
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
