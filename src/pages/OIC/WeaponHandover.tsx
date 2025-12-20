import { Search } from "lucide-react";

export default function WeaponHandover() {
  const weapons = [
    {
      type: "AK 47",
      serial: "G-1359",
      status: "Available",
      assignedTo: "--",
      dueBack: "--",
    },
    {
      type: "Minimi",
      serial: "T-4579",
      status: "Overdue",
      assignedTo: "J.B.Millawithanachchi",
      dueBack: "27/11/2025",
    },
    {
      type: "Space 12",
      serial: "G-0851",
      status: "Available",
      assignedTo: "A.B.C.Bandara",
      dueBack: "03/12/2025",
    },
    {
      type: "Glock 17",
      serial: "K-6438",
      status: "Available",
      assignedTo: "--",
      dueBack: "--",
    },
        {
      type: "Glock 17",
      serial: "K-6438",
      status: "Available",
      assignedTo: "--",
      dueBack: "--",
    },
  ];

  return (
    <>
    <div className="flex min-h-screen bg-[#3b4a5f] text-white">
  
 
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="bg-[#111827] pt-3 pb-8 pl-11 pr-11">
             <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Weapon management</h1>
          <button className="bg-red-600 px-6 py-2 rounded-full font-semibold hover:bg-red-700">
            Add Weapon
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-40 mt-6 ">
          {[
            { label: "Total Weapon", value: 130 },
            { label: "Available", value: 83 },
            { label: "Issued", value: 37 },
           
          ].map((card) => (
            <div
              key={card.label}
              className="bg-[#3b4a5f] rounded-xl p-6 text-center"
            >
              <p className="text-white text-lg">{card.label}</p>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </div>

        </div>
       
        {/* Table Section */}
        <div className="bg-[#111827] rounded-xl mt-8 p-6">
          <div className="flex flex-row justify-between">
            <div className="text-lg">Data Table</div>
            <div className="flex justify-end mb-4 ">
            <div className="relative bg-white rounded-md ">
              <Search className="absolute left-28 top-2.5 text-gray-400" size={20} />
              <input
                placeholder="Search........"
                className="pl-40 pr-4 py-2 rounded-lg text-black    text-lg outline-none"
              />
            </div>
          </div>
          </div>
       

          <table className="w-full text-lg">
            <thead className="text-gray-400 border-b bg-[#3b4a5f] border-gray-700">
              <tr className="">
                <th className="py-3 text-left ">Weapon Type</th>
                <th className="text-left ml-10">Serial No</th>
                <th className="text-left">Status</th>
                <th className="text-left">Assigned to</th>
                <th className="text-left">Due Back</th>
                <th className="text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {weapons.map((w) => (
                <tr key={w.serial} className="border-b border-gray-800">
                  <td className="py-4">{w.type}</td>
                  <td>{w.serial}</td>
                  <td
                    className={`font-semibold ${
                      w.status === "Available"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    • {w.status}
                  </td>
                  <td>{w.assignedTo}</td>
                  <td>{w.dueBack}</td>
                  <td>
                    <button
                      className={`border px-8 py-1 rounded-full text-lg transition
                        ${
                          w.status === "Available"
                            ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        }
                      `}
                    >
                      {w.status === "Available" ? "Issued" : "Return"}
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
    </>
  );
}
