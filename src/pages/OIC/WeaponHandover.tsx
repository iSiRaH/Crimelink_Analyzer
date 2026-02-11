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
              className="bg-purple-primary text-white border-none px-6 py-2.5 rounded-[25px] text-base font-medium cursor-pointer transition-colors duration-300 hover:bg-purple-hover"
            >
              Weapon Operator
            </button>
          </div>

          {/* ✅ DB-DRIVEN COUNTS (DESIGN UNCHANGED) */}
          <div className="flex justify-around mt-5">
            {[
              { label: "Total Weapon", value: totalCount },
              { label: "Available", value: availableCount },
              { label: "Issued", value: issuedCount },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-dark-primary px-10 py-5 rounded-[50px] text-center"
              >
                <p className="text-lg">{card.label}</p>
                <p className="text-3xl font-bold block">{card.value}</p>
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
          <div className="flex justify-between gap-4 mb-3">
            <div className="flex gap-2">
              {["ALL", "Available", "Issued"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s as any)}
                  className={`border border-purple-primary px-5 py-1.5 rounded-[20px] cursor-pointer ${
                    statusFilter === s
                      ? "bg-dark-primary text-purple-primary"
                      : "bg-transparent text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative ml-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60"
                size={18}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search weapon or serial"
                className="bg-dark-primary border border-gray-border rounded-[20px] py-2 px-5 pl-10 text-white text-sm w-full outline-none placeholder:text-gray-text"
              />
            </div>
          </div>

          {/* TABLE */}
          <table className="w-full border-collapse">
            <thead className="text-left p-4 border-b-2 border-dark-primary">
              <tr>
                <th className="py-2 pl-4">Weapon</th>
                <th>Serial</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>Due Back</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredWeapons.map((w, i) => (
                <tr key={i} className="border-b border-gray-700">
                  <td className="p-4 bg-dark-secondary border-b border-dark-primary">
                    {w.type}
                  </td>
                  <td className="p-4 bg-dark-secondary border-b border-dark-primary">
                    {w.serial}
                  </td>
                  <td
                    className={`p-4 bg-dark-secondary border-b border-dark-primary ${
                      w.status === "Available"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    • {w.status}
                  </td>
                  <td className="p-4 bg-dark-secondary border-b border-dark-primary">
                    {w.assignedTo}
                  </td>
                  <td className="p-4 bg-dark-secondary border-b border-dark-primary">
                    {w.dueBack}
                  </td>
                  <td className="p-4 bg-dark-secondary border-b border-dark-primary">
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
