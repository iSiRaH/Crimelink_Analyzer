import { useState } from "react";
import { Search } from "lucide-react";
import IssueWeaponModal from "./IssueWeaponModal";
import ReturnWeaponModal from "./ReturnWeaponModal";  
export default function WeaponHandover() {
  const weapons = [
    { type: "AK 47", serial: "G-1359", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Minimi", serial: "T-4579", status: "Issued", assignedTo: "J.B.Millawithanachchi", dueBack: "27/11/2025" },
    { type: "Space 12", serial: "G-0851", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Glock 17", serial: "K-6438", status: "Issued", assignedTo: "A.B.C.Bandara", dueBack: "03/12/2025" },
    { type: "AK 47", serial: "G-1359", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Minimi", serial: "T-4579", status: "Issued", assignedTo: "J.B.Millawithanachchi", dueBack: "27/11/2025" },
    { type: "Space 12", serial: "G-0851", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Glock 17", serial: "K-6438", status: "Issued", assignedTo: "A.B.C.Bandara", dueBack: "03/12/2025" },
     { type: "AK 47", serial: "G-1359", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Minimi", serial: "T-4579", status: "Issued", assignedTo: "J.B.Millawithanachchi", dueBack: "27/11/2025" },
    { type: "Space 12", serial: "G-0851", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Glock 17", serial: "K-6438", status: "Issued", assignedTo: "A.B.C.Bandara", dueBack: "03/12/2025" },
    { type: "AK 47", serial: "G-1359", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Minimi", serial: "T-4579", status: "Issued", assignedTo: "J.B.Millawithanachchi", dueBack: "27/11/2025" },
    { type: "Space 12", serial: "G-0851", status: "Available", assignedTo: "--", dueBack: "--" },
    { type: "Glock 17", serial: "K-6438", status: "Issued", assignedTo: "A.B.C.Bandara", dueBack: "03/12/2025" },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Available" | "Issued">("ALL");

  /* ================= MODAL STATES ================= */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null);

  const [isReturnOpen,setIsReturnOpen]=useState(false);

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

  const onIssueClick = (weapon: any) => {
    setSelectedWeapon(weapon);
    setIsModalOpen(true);
  };

  const onReturnClick=()=>{
    setIsReturnOpen(true);
  }

  return (
    
    <div className="relative flex min-h-screen bg-[#3b4a5f] text-white">

     
      <main
        className={`flex-1 p-3 transition-all duration-300 ${
          isModalOpen ? "opacity-20 pointer-events-none" : "opacity-100"
        }  ${
          isReturnOpen ? "opacity-20 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* HEADER */}
        <div className="bg-[#111827] pt-2 pb-3 pl-11 pr-11 rounded-xl">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Weapon management</h1>
            <button className="bg-red-600 px-6 py-2 rounded-full font-semibold hover:bg-red-700">
              Add Weapon
            </button>
          </div>

          <div className="grid grid-cols-3 gap-40 mt-5">
            {[{ label: "Total Weapon", value: 130 }, { label: "Available", value: 83 }, { label: "Issued", value: 37 }].map(
              (card) => (
                <div key={card.label} className="bg-[#3b4a5f] rounded-xl p-1 text-center">
                  <p className="text-white text-lg">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#111827] rounded-xl mt-4 p-3">
          {/* FILTER BAR */}
          <div className="flex justify-around mb-2">
            <div className="flex w-1/4 gap-1">
              {["ALL", "Available", "Issued"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s as any)}
                  className={`px-3 h-8 rounded-full border transition w-1/3 text-md ${
                    statusFilter === s
                      ? "bg-white text-black"
                      : "border-gray-500 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative w-1/3">
              <Search className="absolute left-10 top-2.5 text-gray-400" size={20} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Weapon / Serial Number"
                className="pl-10 pr-4 py-2 w-full rounded-lg text-center text-md outline-none bg-transparent border border-gray-500 text-gray-300 hover:bg-gray-700"
              />
            </div>
          </div>

          {/* TABLE */}
          <table className="w-full text-md  ">
            <thead className="text-gray-400 border-b-2 bg-[#3b4a5f] border-gray-700">
              <tr>
                <th className="py-1 text-left pl-5">Weapon Type</th>
                <th className="text-left">Serial No</th>
                <th className="text-left">Status</th>
                <th className="text-left">Assigned to</th>
                <th className="text-left">Due Back</th>
                <th className="text-left">Action</th>
              </tr>
            </thead>
            
            <tbody>
              {filteredWeapons.map((w, index) => (
                <tr key={index} className="border-b border-gray-800 max-h-[50vh] overflow-y-auto no-scrollbar ">
                  <td className="py-2 pl-5">{w.type}</td>
                  <td>{w.serial}</td>
                  <td className={`font-semibold ${w.status === "Available" ? "text-green-500" : "text-red-500"}`}>
                    • {w.status}
                  </td>
                  <td>{w.assignedTo}</td>
                  <td>{w.dueBack}</td>
                  <td>
                    {w.status === "Available" ? (
                      <button
                        onClick={() => onIssueClick(w)}
                        className="border border-green-500 text-green-500 px-5 rounded-full text-md hover:bg-green-500 hover:text-white w-24"
                      >
                        Issue
                      </button>
                    ) : (
                      <button
                      onClick={() => onReturnClick()}
                      className="border border-red-500 text-red-500 px-5 rounded-full text-md hover:bg-red-500 hover:text-white w-24">
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

    
      {isModalOpen && (
        <IssueWeaponModal
          weapon={selectedWeapon}
          onClose={() => setIsModalOpen(false)}
        />
      )}

         {isReturnOpen && (
        <ReturnWeaponModal
          weapon={selectedWeapon}
          onClose={() => setIsReturnOpen(false)}
        />
      )}
    </div>
  );
}
