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
    <div className="min-h-screen bg-[#1a1f2e] text-white p-6">

      {!showManageWeapon && (
        <div className="bg-[#0f1419] rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Weapon Management</h1>
            <button
              onClick={() => setShowManageWeapon(true)}
              className="bg-[#4169E1] hover:bg-[#5179f1] px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
            >
              Weapon Operator
            </button>
          </div>

          {/* ✅ DB-DRIVEN COUNTS */}
          <div className="grid grid-cols-3 gap-8">
            {[
              { label: "Total Weapon", value: totalCount },
              { label: "Available", value: availableCount },
              { label: "Issued", value: issuedCount },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-[#0a0e15] rounded-3xl p-6 text-center shadow-lg"
              >
                <p className="text-slate-400 text-sm font-medium mb-3">{card.label}</p>
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
        <div className="bg-[#0f1419] rounded-2xl mt-6 p-6 shadow-2xl">

          {/* FILTER BAR */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3">
              {["ALL", "Available", "Issued"].map((s) => {
                const isActive = statusFilter === s;
                let buttonClass = "px-6 py-2 rounded-full font-medium transition-all duration-200 text-sm ";
                
                if (s === "Available") {
                  buttonClass += isActive 
                    ? "bg-green-600 text-white border-2 border-green-600" 
                    : "border-2 border-[#2d3748] text-white bg-transparent hover:border-green-600";
                } else if (s === "Issued") {
                  buttonClass += isActive 
                    ? "bg-[#6366f1] text-white border-2 border-[#6366f1]" 
                    : "border-2 border-[#2d3748] text-white bg-transparent hover:border-[#6366f1]";
                } else {
                  buttonClass += isActive 
                    ? "bg-[#4169E1] text-white border-2 border-[#4169E1]" 
                    : "border-2 border-[#2d3748] text-white bg-transparent hover:border-[#4169E1]";
                }
                
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s as any)}
                    className={buttonClass}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            <div className="relative w-1/3">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search weapon or serial"
                className="pl-12 pr-4 py-2.5 w-full bg-transparent border-2 border-[#2d3748] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#4169E1] transition-colors text-sm"
              />
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-3">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <span className="ml-3 text-lg">Loading weapons...</span>
            </div>
          ) : (
            <>
              {/* TABLE */}
              <div className="overflow-hidden rounded-xl">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#1a1f2e]">
                      <th className="py-3 px-6 text-left text-white font-medium text-sm">Weapon</th>
                      <th className="py-3 px-6 text-left text-white font-medium text-sm">Serial</th>
                      <th className="py-3 px-6 text-left text-white font-medium text-sm">Status</th>
                      <th className="py-3 px-6 text-left text-white font-medium text-sm">Assigned</th>
                      <th className="py-3 px-6 text-left text-white font-medium text-sm">Due Back</th>
                      <th className="py-3 px-6 text-left text-white font-medium text-sm">Action</th>
                    </tr>
                  </thead>

                  <tbody className="bg-[#0f1419]">
                    {filteredWeapons.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-gray-400">
                          {weapons.length === 0 
                            ? "No weapons found in the database." 
                            : "No weapons match your search criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredWeapons.map((w, i) => (
                  <tr 
                    key={i} 
                    className="border-t border-[#1a1f2e] hover:bg-[#14181f] transition-colors"
                  >
                    <td className="py-3.5 px-6 font-normal text-white text-sm">{w.type}</td>
                    <td className="py-3.5 px-6 text-white text-sm">{w.serial}</td>
                    <td className="py-3.5 px-6">
                      <span className={`font-medium text-sm ${w.status === "Available" ? "text-green-500" : "text-red-500"}`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-white text-sm">{w.assignedTo}</td>
                    <td className="py-3.5 px-6">
                      <span className={isWeaponOverdue(w.dueBack) ? "text-red-500 font-semibold text-sm" : "text-white text-sm"}>
                        {w.dueBack}
                        {isWeaponOverdue(w.dueBack) && " ⚠️"}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      {w.status === "Available" ? (
                        <button
                          onClick={() => {
                            setSelectedWeapon(w);
                            setIsIssueOpen(true);
                          }}
                          className="bg-transparent border-2 border-green-600 text-green-500 px-5 py-1 rounded-full font-medium hover:bg-green-600/10 transition-all duration-200 text-sm"
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
                          className="bg-transparent border-2 border-red-600 text-red-500 px-4 py-1 rounded-full font-medium hover:bg-red-600/10 transition-all duration-200 text-sm"
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