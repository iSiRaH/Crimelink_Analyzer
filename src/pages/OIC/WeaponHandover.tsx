import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import IssueWeaponModal from "./IssueWeaponModal";
import ReturnWeaponModal from "./ReturnWeaponModal";
import ManageWeaponSimple from "./ManageWeapon";

export default function WeaponHandover() {
  const weapons = [
    { type: "AK 47", serial: "G-1359", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Minimi", serial: "T-4579", status: "Issued", assignedTo: "J.B.Millawithanachchi", dueBack: "27/11/2025" },
    { type: "Space 12", serial: "G-0851", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Glock 17", serial: "K-6438", status: "Issued", assignedTo: "A.B.C.Bandara", dueBack: "03/12/2025" },
    { type: "Minimi", serial: "T-4579", status: "Issued", assignedTo: "J.B.Millawithanachchi", dueBack: "27/11/2025" },
    { type: "Space 12", serial: "G-0851", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Glock 17", serial: "K-6438", status: "Issued", assignedTo: "A.B.C.Bandara", dueBack: "03/12/2025" },
    { type: "Minimi", serial: "T-4579", status: "Issued", assignedTo: "J.B.Millawithanachchi", dueBack: "27/11/2025" },
    { type: "Space 12", serial: "G-0851", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Glock 17", serial: "K-6438", status: "Issued", assignedTo: "A.B.C.Bandara", dueBack: "03/12/2025" },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | "Available" | "Issued">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null);

  const [showManageWeapon, setShowManageWeapon] = useState(false);

  useEffect(() => {
    if (isModalOpen || isReturnOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isModalOpen, isReturnOpen]);

  const filteredWeapons = weapons.filter((w) => {
    const matchesSearch =
      w.type.toLowerCase().includes(search.toLowerCase()) ||
      w.serial.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "Available" && w.status === "Available") ||
      (statusFilter === "Issued" && w.status !== "Available");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#3b4a5f] text-white p-3">
      {/* HEADER */}
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


  
    <div className="grid grid-cols-3 gap-40 mt-5">
      {[
        { label: "Total Weapon", value: 130 },
        { label: "Available", value: 83 },
        { label: "Issued", value: 37 },
      ].map((card) => (
        <div
          key={card.label}
          className="bg-[#3b4a5f] rounded-xl p-1 text-center"
        >
          <p className="text-white text-lg">{card.label}</p>
          <p className="text-3xl font-bold mt-1">{card.value}</p>
        </div>
      ))}
    </div>
  
</div>

)}
      {/* MANAGE WEAPON INLINE */}
      {showManageWeapon && (
        <ManageWeaponSimple onBack={() => setShowManageWeapon(false)} />
      )}

      {/* WEAPON TABLE */}
      {!showManageWeapon && (
        <div className="bg-[#111827] rounded-xl mt-4 p-3">
          {/* FILTER */}
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
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
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
                  <td className={w.status === "Available" ? "text-green-400" : "text-red-400"}>
                    • {w.status}
                  </td>
                  <td>{w.assignedTo}</td>
                  <td>{w.dueBack}</td>
                  <td>
                    {w.status === "Available" ? (
                      <button
                        onClick={() => {
                          setSelectedWeapon(w);
                          setIsModalOpen(true);
                        }}
                        className="border border-green-500 text-green-500 px-4 rounded-full w-20"
                      >
                        Issue
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedWeapon(w);
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

      {isModalOpen && (
        <IssueWeaponModal
          weapon={selectedWeapon}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isReturnOpen && (
        <ReturnWeaponModal
   
          onClose={() => setIsReturnOpen(false)}
        />
      )}
    </div>
  );
}
