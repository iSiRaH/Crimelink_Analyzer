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
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | "Available" | "Issued">("ALL");
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
      const errorMsg = err?.response?.data?.error || err?.message || "Failed to load weapons";
      console.error("Failed to load weapons:", err);
      console.error("Error details:", err?.response?.data);
      setError(errorMsg + ". Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= COUNTS (FROM DB) ================= */

  const totalCount = weapons.length;
  const availableCount = weapons.filter(
    (w) => w.status === "Available"
  ).length;
  const issuedCount = weapons.filter(
    (w) => w.status === "Issued"
  ).length;

  /* ================= FILTER ================= */

  const filteredWeapons = weapons.filter((w) => {
    const matchesSearch =
      w.type.toLowerCase().includes(search.toLowerCase()) ||
      w.serial.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || w.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-8">

      {!showManageWeapon && (
        <div className="bg-[#1c2333] rounded-2xl pl-8 pr-8 pt-3 pb-3 shadow-2xl rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold text-white">Weapon Management</h1>
            <button
              onClick={() => setShowManageWeapon(true)}
              className="bg-[#4c7ce5] hover:bg-[#5a8aef] px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm text-white"
            >
              Weapon operator
            </button>
          </div>

          {/* ✅ DB-DRIVEN COUNTS */}
          <div className="grid grid-cols-3 gap-52 rounded-full mx-5">
            {[
              { label: "Total Weapons", value: totalCount },
              { label: "Total Weapons", value: availableCount },
              { label: "Total Weapons", value: issuedCount },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-[#0d1117] rounded-full p-2 text-center border border-slate-700/40"
              >
                <p className="text-white text-lg font-medium mb-1">{card.label}</p>
                <p className="text-5xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>
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

      {/* TABLE */}
      {!showManageWeapon && (
        <div className="bg-[#1c2333] rounded-3xl mt-6 p-0 pt-3 shadow-2xl">

          {/* FILTER BAR */}
          <div className="flex justify-between items-center mb-5 mx-7">
            <div className="flex gap-3">
              {(["ALL", "Available", "Issued"] as const).map((s) => {
                const isActive = statusFilter === s;
                const base = 'px-7 py-2.5 rounded-full font-medium transition-all duration-200 text-sm';
                const active = 'bg-[#0b0f16] text-blue-400 ring-1 ring-blue-700/30';
                const inactive = 'bg-[#1c2333] text-white border border-blue-600/40 hover:border-blue-500';

                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`${base} ${isActive ? active : inactive}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <div className="relative w-96">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search weapon or serial"
                className="pl-11 pr-4 py-3 w-full bg-[#0b0f16] rounded-md ring-1 ring-blue-700/30rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-all text-sm"
              />
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={loadWeapons}
                className="mt-2 text-sm underline hover:text-red-300"
              >
                Retry
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg font-medium">Loading weapons...</span>
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="overflow-hidden ">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0d1117] ml-1  mr-0">
                      <th className="py-4 px-10 text-left text-white font-medium text-sm">Weapon</th>
                      <th className="py-4 px-8 text-left text-white font-medium text-sm">Serial</th>
                      <th className="py-4 px-8 text-left text-white font-medium text-sm">Status</th>
                      <th className="py-4 px-8 text-left text-white font-medium text-sm">Assigned</th>
                      <th className="py-4 px-8 text-left text-white font-medium text-sm">Due Back</th>
                      <th className="py-4 px-10 text-left text-white font-medium text-sm">Action</th>
                    </tr>
                  </thead>

                  <tbody className="bg-[#1c2333]">
                    {filteredWeapons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500 font-medium">
                          {weapons.length === 0 
                            ? "No weapons found in the database." 
                            : "No weapons match your search criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredWeapons.map((w, i) => (
                        <tr 
                          key={i} 
                          className="border-t border-[#2d3748] hover:bg-[#252d3d] transition-colors"
                        >
                          <td className="py-4 px-10 text-left font-medium text-white text-sm">{w.type}</td>
                          <td className="py-4 px-8 text-left text-slate-300 text-sm">{w.serial}</td>
                          <td className="py-4 px-8 text-left">
                            <span className={`font-medium text-sm ${
                              w.status === "Available" ? "text-green-500" : "text-[#ef4444]"
                            }`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="py-4 px-8 text-left text-slate-300 text-sm">{w.assignedTo}</td>
                          <td className="py-4 px-8 text-left">
                            <span className={
                              isWeaponOverdue(w.dueBack) 
                                ? "text-[#ef4444] font-semibold text-sm" 
                                : "text-slate-300 text-sm"
                            }>
                              {w.dueBack}
                              {isWeaponOverdue(w.dueBack) && " ⚠️"}
                            </span>
                          </td>
                          <td className="py-4 px-8 text-left">
                            {w.status === "Available" ? (
                              <button
                                onClick={() => {
                                  setSelectedWeapon(w);
                                  setIsIssueOpen(true);
                                }}
                                className="bg-transparent border-2 border-green-600 text-green-500 px-6 py-1.5 rounded-full font-medium hover:bg-green-600/10 transition-all duration-200 text-xs"
                              >
                                Issue
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
                                className="bg-transparent border-2 border-[#ef4444] text-[#ef4444] px-6 py-1.5 rounded-full font-medium hover:bg-[#ef4444]/10 transition-all duration-200 text-xs"
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