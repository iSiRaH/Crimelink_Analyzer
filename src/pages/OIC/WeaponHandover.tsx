import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import IssueWeaponModal from "./IssueWeaponModal";
import ReturnWeaponModal from "./ReturnWeaponModal";
import ManageWeaponSimple from "./ManageWeapon";
import { getAllWeapons } from "../../api/weaponApi";

/* ================= TYPES ================= */

type WeaponRow = {
  type: string;
  serial: string;
  status: "Available" | "Issued";
  assignedTo: string;
  dueBack: string;
  issuedDate?: string;
};

type ApiWeapon = {
  serialNumber: string;
  weaponType: string;
  status: string;
};

/* ================= COMPONENT ================= */

export default function WeaponHandover() {
  const [weapons, setWeapons] = useState<WeaponRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "Available" | "Issued"
  >("ALL");

  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null);
  const [showManageWeapon, setShowManageWeapon] = useState(false);

  /* ================= LOAD WEAPONS ================= */

  useEffect(() => {
    loadWeapons();
  }, []);

  const loadWeapons = async () => {
    try {
      const res = await getAllWeapons();

      const mapped: WeaponRow[] = res.data.map((w: ApiWeapon) => ({
        type: w.weaponType,
        serial: w.serialNumber,
        status: w.status === "ISSUED" ? "Issued" : "Available",

        // keep logic unchanged
        assignedTo: w.status === "ISSUED" ? "Officer Name" : "--",
        dueBack: w.status === "ISSUED" ? "2025-12-31" : "--",
        issuedDate: w.status === "ISSUED" ? "2025-12-01" : undefined,
      }));

      setWeapons(mapped);
    } catch (err) {
      console.error(err);
      alert("Failed to load weapons");
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
    <div className="min-h-screen bg-dark-bg text-white p-3">
      {!showManageWeapon && (
        <div className="bg-dark-panel rounded-xl p-4">
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
        <div className="bg-dark-panel rounded-xl mt-4 p-3">
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
              {filteredWeapons.map((w, i) => (
                <tr key={i} className="border-b border-gray-700">
                  <td className="pl-4 py-2">{w.type}</td>
                  <td>{w.serial}</td>
                  <td
                    className={
                      w.status === "Available"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    • {w.status}
                  </td>
                  <td>{w.assignedTo}</td>
                  <td>{w.dueBack}</td>
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
              ))}
            </tbody>
          </table>
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
