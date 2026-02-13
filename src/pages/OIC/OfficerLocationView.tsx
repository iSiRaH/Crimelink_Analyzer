import { IoSearch } from "react-icons/io5";
import FieldOfficerCard from "../../components/UI/FieldOfficerCard";
import { useEffect, useState } from "react";
import type { OfficerInfo } from "../../types/officers";
import { fetchFieldOfficers } from "../../services/officerLocation";
import OfficerLocationPopup from "../../components/UI/OfficerLocationPopup";

const OfficerLocationView = () => {
  const [officers, setOfficers] = useState<OfficerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerInfo | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleSearch = () => {
    console.log("Searching for:", searchTerm);
  };

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
              onClick={() => handleSearch()}
              disabled={loading}
            >
              Search
            </button>
            <button
              className="h-10 sm:h-11 px-5 sm:px-6 rounded-lg border-none text-sm font-semibold cursor-pointer flex items-center gap-2 transition-opacity hover:opacity-90 bg-green-500 text-white"
              onClick={() => fetchOfficers()}
              disabled={loading}
            >
              Refresh
            </button>
            <button className="bg-blue-200 border-blue-400 border-2 text-blue-600 px-3 py-1 rounded-full">
              On Duty
            </button>
            <button className="bg-blue-200 border-blue-400 border-2 text-blue-600 px-3 py-1 rounded-full">
              Off Duty
            </button>
          </div>
        </div>
        <div className="w-full flex flex-col gap-6 overflow-x-auto p-6 bg-dark-panel rounded-xl sm:px-5">
          {loading ? (
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />{" "}
              <p>loading ...</p>
            </div>
          ) : (
            officers.map((officer) => (
              <FieldOfficerCard
                id={officer.badgeNo}
                name={officer.name}
                onPress={() => onOfficerClick(officer)}
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
