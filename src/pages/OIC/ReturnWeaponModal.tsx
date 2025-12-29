import React from "react";

type Officer = {
  name: string;
  serviceNo: string;
  rank: string;
};

type Props = {
  onClose: () => void;
};

export default function ReturnWeaponModal({ onClose }: Props) {
  // ----- MOCK DATA -----
  const weapon = {
    name: "Minimi",
    serial: "T-4579",
    status: "Issued",
    issuedDate: "2025-11-01",
    dueDate: "2025-11-27",
  };

  const issuedTo: Officer = {
    name: "J.B. Millawithanachchi",
    serviceNo: "P-3841",
    rank: "Sergeant",
  };

  const returnedBy: Officer = {
    name: "Samantha Perera",
    serviceNo: "P-7932",
    rank: "Sergeant",
  };

  // ----- AUTO DATE & TIME -----
  const now = new Date();
  const returnDate = now.toISOString().split("T")[0];
  const returnTime = now.toTimeString().slice(0, 5);

  // ----- OVERDUE CALCULATION -----
  const overdueDays =
    Math.floor(
      (new Date(returnDate).getTime() -
        new Date(weapon.dueDate).getTime()) /
        (1000 * 60 * 60 * 24)
    ) || 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      {/* MODAL */}
      <div className="w-[450px] backdrop-blur-xl text-white rounded-xl border border-gray-700 shadow-xl p-5">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3 ">
          <h2 className="text-xl font-semibold">Return Weapon</h2>

          {/* X BUTTON */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* OVERDUE WARNING */}
        {overdueDays > 0 && (
          <div className="mb-3 bg-yellow-900/40 border border-yellow-500 text-yellow-300 px-3 py-2 rounded-md text-sm">
            ⚠ Overdue by <span className="font-semibold">{overdueDays}</span> days
          </div>
        )}

        {/* WEAPON INFO */}
        <div className="w-full flex flex-col bg-[#111A2E] rounded-lg p-3 mb-3 text-sm">
          <div className="w-full grid grid-cols-2">
            <p>Weapon: <span className="text-white">{weapon.name}</span></p>
            <p>Serial No: <span className="text-white">{weapon.serial}</span></p>
          </div>
          <div className="w-full grid grid-cols-2">
            <p>Issued Date: {weapon.issuedDate}</p>
            <p>Due Back Date: {weapon.dueDate}</p>
          </div>
          
        </div>

    <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#0F172A] rounded-xl p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Issued To</p>
            <p className="font-medium text-sm">{issuedTo.name}</p>
            <p className="text-xs text-gray-400">
              {issuedTo.rank} • {issuedTo.serviceNo}
            </p>
          </div>

          <div className="bg-[#0F172A] rounded-xl p-3 border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Returned By</p>
            <p className="font-medium text-sm">{returnedBy.name}</p>
            <p className="text-xs text-gray-400">
              {returnedBy.rank} • {returnedBy.serviceNo}
            </p>
          </div>
        </div>
        
         {/* RETURN TIME */}
         <span className="text-md text-gray-300">Return Date & Time</span>
       
        <div className="w-full  flex justify-between gap-5 mb-4 ">
                <div className="w-1/2">
                    <span className="text-sm text-gray-400 ">Returned Date</span>
                    <input
                        value={returnDate }
                        readOnly
                        className="bg-gray-900 border w-full  border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
                    />
                </div>
                <div className="w-1/2 ">
                    <span className="text-sm text-gray-400">Returned Time</span>
                    <input
                        value={returnTime}
                        readOnly
                        className="bg-gray-900 w-full border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
                    />
                </div>
              
            </div>

        {/* REMARK */}
        <div className="mb-4">
          <textarea
            placeholder="Enter remark..."
            className="w-full h-20 bg-[#0B1220] border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

           {/* Confirmation */}
          <div className="flex gap-2 text-xs text-gray-400 mb-5">
            <input type="checkbox" />
            <p>I confirm all Return details are correct.</p>
          </div>

        {/* ACTIONS */}
        <div className="w-full flex flex-row gap-5">
          <button
            onClick={onClose}
            className="w-1/2 px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>

          <button className="w-1/2 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700">
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
}
