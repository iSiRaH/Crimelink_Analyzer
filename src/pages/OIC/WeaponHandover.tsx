import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import IssueWeaponModal from "./IssueWeaponModal";
import ReturnWeaponModal from "./ReturnWeaponModal";
import ManageWeaponSimple from "./ManageWeapon";
import { getAllWeaponsWithDetails } from "../../api/weaponApi";
import type { WeaponResponseDTO } from "../../types/weapon";
import { formatWeaponDate, isWeaponOverdue } from "../../utils/weaponUtils";

/* ================= TYPES ================= */

type WeaponRow = {
  type: string;
  serial: string;
  status: "Available" | "Issued";
  assignedTo: string;
  dueBack: string;
  issuedDate?: string;
};

/* ================= COMPONENT ================= */

/**
 * WeaponHandover Component
 *
 * Manages weapon inventory, issue, and return operations for OIC role.
 * Features:
 * - Real-time weapon status tracking from database
 * - Search and filter capabilities
 * - Issue weapons to officers
 * - Process weapon returns
 * - Overdue weapon alerts
 *
 * @returns JSX.Element - The weapon handover management interface
 */
export default function WeaponHandover() {
  const [weapons, setWeapons] = useState<WeaponRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "Available" | "Issued"
  >("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null);

  const [showManageWeapon, setShowManageWeapon] = useState(false);

  /* ================= LOAD WEAPONS ================= */

  useEffect(() => {
    loadWeapons();
  }, []);

  /**
   * Fetches weapon data from the backend API
   * Includes weapon details, assignment info, and due dates
   * Handles loading states and error scenarios
   */
  const loadWeapons = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAllWeaponsWithDetails();
      const mapped: WeaponRow[] = res.data.map((w: WeaponResponseDTO) => ({
        type: w.weaponType,
        serial: w.serialNumber,
        status: w.status === "ISSUED" ? "Issued" : "Available",
        assignedTo: w.issuedTo?.name ?? "--",
        dueBack: formatWeaponDate(w.dueDate),
        issuedDate: w.issuedDate,
      }));
      setWeapons(mapped);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load weapons";
      console.error("Failed to load weapons:", err);
      console.error("Error details:", err?.response?.data);
      setError(errorMsg + ". Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= COUNTS (FROM DB) ================= */

  const totalCount = weapons.length;
  const availableCount = weapons.filter((w) => w.status === "Available").length;
  const issuedCount = weapons.filter((w) => w.status === "Issued").length;

  /* ================= FILTER ================= */

  const filteredWeapons = weapons.filter((w) => {
    const matchesSearch =
      w.type.toLowerCase().includes(search.toLowerCase()) ||
      w.serial.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#0f1219] text-white p-6">
      {!showManageWeapon && (
        <div className="max-w-7xl mx-auto">
          {/* HEADER CONTAINER */}
          <div className="bg-[#1a1f2e] rounded-3xl p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Weapon Management</h1>
              <button
                onClick={() => setShowManageWeapon(true)}
                className="bg-[#4169e1] px-5 py-2 rounded-lg hover:bg-[#5179f1] transition-colors text-sm"
              >
                Weapon operator
              </button>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-3 gap-40">
              {[
                { label: "Total Weapons", value: totalCount },
                { label: "Total Weapons", value: availableCount },
                { label: "Total Weapons", value: issuedCount },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="bg-[#0a0d14] rounded-3xl p-5 text-center"
                >
                  <p className="text-white text-lg mb-2">{card.label}</p>
                  <p className="text-4xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FILTERS & SEARCH BAR */}
          <div className="bg-[#1a1f2e] rounded-3xl p-4 mb-4">
            <div className="flex justify-between items-center">
              {/* Filter Tabs */}
              <div className="flex gap-3">
                {[
                  { label: "All", value: "ALL" },
                  { label: "Available", value: "Available" },
                  { label: "Issued", value: "Issued" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value as any)}
                    className={`px-6 py-2 rounded-full text-sm transition-all ${
                      statusFilter === tab.value
                        ? tab.value === "Issued"
                          ? "bg-transparent border border-[#6366f1] text-[#6366f1]"
                          : "bg-transparent border border-blue-500 text-white"
                        : "bg-transparent border border-gray-600 text-gray-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search weapon or serial"
                  className="pl-10 pr-4 py-2 w-80 bg-transparent border border-blue-500 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-sm text-gray-400 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold mb-1">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={loadWeapons}
                className="mt-2 text-xs bg-red-500/20 px-3 py-1 rounded hover:bg-red-500/30"
              >
                Retry
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {isLoading ? (
            <div className="bg-[#1a1f2e] rounded-3xl p-12 text-center">
              <p className="text-gray-400">Loading weapons...</p>
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="bg-[#1a1f2e] rounded-3xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-4 text-white font-medium text-sm">
                        Weapon
                      </th>
                      <th className="text-left px-6 py-4 text-white font-medium text-sm">
                        Serial
                      </th>
                      <th className="text-left px-6 py-4 text-white font-medium text-sm">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-white font-medium text-sm">
                        Assigned
                      </th>
                      <th className="text-left px-6 py-4 text-white font-medium text-sm">
                        Due Back
                      </th>
                      <th className="text-left px-6 py-4 text-white font-medium text-sm">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWeapons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-500">
                          {weapons.length === 0
                            ? "No weapons found in the database."
                            : "No weapons match your search criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredWeapons.map((w, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-800/50"
                        >
                          <td className="px-6 py-4 text-white text-sm">{w.type}</td>
                          <td className="px-6 py-4 text-white text-sm">{w.serial}</td>
                          <td className="px-6 py-4">
                            <span className={`text-sm lowercase ${
                              w.status === "Issued" ? "text-[#ef4444]" : "text-[#22c55e]"
                            }`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white text-sm">
                            {w.assignedTo}
                          </td>
                          <td className="px-6 py-4 text-white text-sm">
                            {w.dueBack}
                            {isWeaponOverdue(w.dueBack) && (
                              <span className="ml-2 text-yellow-500">⚠️</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {w.status === "Available" ? (
                              <button
                                onClick={() => {
                                  setSelectedWeapon(w);
                                  setIsIssueOpen(true);
                                }}
                                className="border border-[#dc2626] text-[#ef4444] px-5 py-1.5 rounded-full text-sm hover:bg-[#dc2626]/10 transition-colors"
                              >
                                Issued
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedWeapon({
                                    type: w.type,
                                    serial: w.serial,
                                    issuedDate: w.issuedDate,
                                    dueBack: w.dueBack,
                                    assignedTo: w.assignedTo,
                                  });
                                  setIsReturnOpen(true);
                                }}
                                className="border border-[#dc2626] text-[#ef4444] px-5 py-1.5 rounded-full text-sm hover:bg-[#dc2626]/10 transition-colors"
                              >
                                Issued
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* MANAGE WEAPON */}
      {showManageWeapon && (
        <ManageWeaponSimple
          onBack={() => {
            setShowManageWeapon(false);
            loadWeapons();
          }}
        />
      )}

      {isIssueOpen && selectedWeapon && (
        <IssueWeaponModal
          weapon={selectedWeapon}
          onClose={() => {
            setIsIssueOpen(false);
            loadWeapons();
          }}
        />
      )}

      {isReturnOpen && selectedWeapon && (
        <ReturnWeaponModal
          weapon={selectedWeapon}
          onClose={() => {
            setIsReturnOpen(false);
            loadWeapons();
          }}
        />
      )}
    </div>
  );
}