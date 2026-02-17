import { IoSearch } from "react-icons/io5";
import FieldOfficerCard from "../../components/UI/FieldOfficerCard";
import { useEffect, useState } from "react";
import type { OfficerInfo } from "../../types/officers";
import { fetchFieldOfficers } from "../../services/officerLocation";
import OfficerLocationPopup from "../../components/UI/OfficerLocationPopup";
import { getOfficerRowsByDate } from "../../api/dutyService";

// const TODAY = new Date().toISOString().split("T")[0]; //IMPLEMENT: use current date to get duty status of the day

const OfficerLocationView = () => {
  const [officers, setOfficers] = useState<OfficerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerInfo | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [officerStatus, setOfficerStatus] = useState<string>("All");

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const data = await fetchFieldOfficers();
      setOfficers(data);
    } catch (err) {
      setError(err?.message || "Failed to fetch officers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  function onOfficerClick(officer: OfficerInfo) {
    console.log(officer);
    setSelectedOfficer(officer);
    setShowPopup(true);
  }

  // const handleSearch = () => {
  //   console.log("Searching for:", searchTerm);
  // }; //REMOVE: serach button removed

  const getStatus = async (date: string) => {
    try {
      const data = await getOfficerRowsByDate(date);
      return data;
    } catch (e) {
      console.error("Error fetching duty status: ", e);
    }
  }; //IMPLEMENT: Show duty status in the card and filter by duty status

  const filteredOfficers = officers
    .filter((officer) => {
      const searchMatch =
        officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.badgeNo.toLowerCase().includes(searchTerm.toLowerCase());

      const filterOfficerStatus =
        officerStatus === "All" || officer.status === officerStatus;
      return searchMatch && filterOfficerStatus;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-dark-bg text-white p-3 flex flex-col gap-6">
        <div className=" flex flex-col justify-center gap-4 bg-dark-panel rounded-xl p-4">
          <h1 className="text-3xl font-semibold">Officer Locations</h1>
          <div className="flex flex-row justify-start items-center gap-5">
            <div className="relative w-full sm:w-[280px] md:w-[320px]">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search officers by name or ID..."
                className="w-full h-10 sm:h-11 rounded-xl border-none pl-11 pr-4 text-sm bg-white text-dark-bg outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="h-10 sm:h-11 px-5 sm:px-6 rounded-lg border-none text-sm font-semibold cursor-pointer flex items-center gap-2 transition-opacity hover:opacity-90 bg-green-500 text-white"
              onClick={() => fetchOfficers()}
              disabled={loading}
            >
              ↻ Refresh
            </button>
            <select
              title="Duty-status"
              value={officerStatus}
              onChange={(e) => setOfficerStatus(e.target.value)}
              className="h-10 sm:h-11 w-full sm:w-auto px-4 sm:px-5 rounded-xl border border-dark-border bg-white text-dark-bg text-sm font-semibold cursor-pointer flex items-center gap-2 min-w-[120px] justify-center hover:bg-gray-100 transition-colors"
            >
              <option value={"All"}>All</option>
              <option value={"Active"}>Active</option>
              <option value={"Inactive"}>Inactive</option>
            </select>
            {/*IMPLEMENT : filter by duty status */}
          </div>
        </div>
        <div className="w-full flex flex-col gap-6 overflow-x-auto p-6 bg-dark-panel rounded-xl sm:px-5">
          {filteredOfficers.length === 0 && !loading && (
            <p className="text-center text-gray-400 text-xl">
              No officers found.
            </p>
          )}
          {loading ? (
            <div className="flex flex-row gap-4 justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />{" "}
              <p className="text-gray-400 text-xl">Loading ...</p>
            </div>
          ) : (
            filteredOfficers.map((officer) => (
              <FieldOfficerCard
                id={officer.badgeNo}
                name={officer.name}
                onPress={() => onOfficerClick(officer)}
                status={officer.status || "Off Duty"} //FIX: change duty status
              />
            ))
          )}
        </div>
      </div>
      {showPopup && selectedOfficer && (
        <OfficerLocationPopup
          open={showPopup}
          onClose={() => {
            setShowPopup(false);
            setSelectedOfficer(null);
          }}
          officer={selectedOfficer}
        />
      )}
    </>
  );
};

export default OfficerLocationView;
