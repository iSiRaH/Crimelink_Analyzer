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
    <div className="min-h-screen bg-[#3b4a5f] text-white p-3">

      {!showManageWeapon && (
        <div className="bg-[#111827] rounded-xl p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Weapon Management</h1>
            <button
              onClick={() => setShowManageWeapon(true)}
              className="bg-red-700 px-6 py-2 rounded-lg hover:bg-red-500"
            >
              Weapon Operator
            </button>
          </div>

          {/* ✅ DB-DRIVEN COUNTS (DESIGN UNCHANGED) */}
          <div className="grid grid-cols-3 gap-40 mt-5">
            {[
              { label: "Total Weapon", value: totalCount },
              { label: "Available", value: availableCount },
              { label: "Issued", value: issuedCount },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-[#3b4a5f] rounded-xl p-1 text-center"
              >
                <p className="text-lg">{card.label}</p>
                <p className="text-3xl font-bold">{card.value}</p>
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
        <div className="bg-[#111827] rounded-xl mt-4 p-3">

          {/* FILTER BAR */}
          <div className="flex justify-between mb-3">
            <div className="flex gap-2">
              {["ALL", "Available", "Issued"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s as any)}
                  className={`px-2 py-1 rounded-full border w-24 ${
                    statusFilter === s
                      ? "bg-white text-black"
                      : "border-blue-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative w-1/3">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search weapon or serial"
                className="pl-10 py-2 w-full bg-transparent border border-blue-900 rounded-lg"
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
              <table className="w-full">
                <thead className="bg-[#3b4a5f]">
                  <tr>
                    <th className="py-2 text-left pl-4">Weapon</th>
                    <th className="text-left">Serial</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Assigned</th>
                    <th className="text-left">Due Back</th>
                    <th className="text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
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
                <tr key={i} className="border-b border-gray-700">
                  <td className="pl-4 py-2">{w.type}</td>
                  <td>{w.serial}</td>
                  <td className={w.status === "Available" ? "text-green-400" : "text-red-400"}>
                    • {w.status}
                  </td>
                  <td>{w.assignedTo}</td>
                  <td>
                    <span className={isWeaponOverdue(w.dueBack) ? "text-red-500 font-semibold" : ""}>
                      {w.dueBack}
                      {isWeaponOverdue(w.dueBack) && " ⚠️"}
                    </span>
                  </td>
                  <td>
                    {w.status === "Available" ? (
                      <button
                        onClick={() => {
                          setSelectedWeapon(w);
                          setIsIssueOpen(true);
                        }}
                        className="border border-green-500 text-green-500 px-4 rounded-full w-20"
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
                        className="border border-red-500 text-red-500 px-4 rounded-full w-20"
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
                    ))
                  )}
                </tbody>
              </table>
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
