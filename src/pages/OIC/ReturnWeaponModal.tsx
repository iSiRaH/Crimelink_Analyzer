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
      <div className="w-[450px] bg-[#0B1220] text-white rounded-xl border border-gray-700 shadow-xl p-5">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
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
        <div className="bg-[#111A2E] rounded-lg p-3 mb-3 text-sm">
          <p>Weapon: <span className="text-white">{weapon.name}</span></p>
          <p>Serial No: <span className="text-white">{weapon.serial}</span></p>
          <p>Status: <span className="text-red-400">{weapon.status}</span></p>
          <p>Issued Date: {weapon.issuedDate}</p>
          <p>Due Back Date: {weapon.dueDate}</p>
        </div>

        {/* ISSUED TO */}
        <div className="mb-3 text-sm">
          <h3 className="font-semibold mb-1">Issued To</h3>
          <p>{issuedTo.name}</p>
          <p>{issuedTo.serviceNo}</p>
          <p>{issuedTo.rank}</p>
        </div>

        {/* RETURNED BY */}
        <div className="mb-3 text-sm">
          <h3 className="font-semibold mb-1">Returned By</h3>
          <p>{returnedBy.name}</p>
          <p>{returnedBy.serviceNo}</p>
          <p>{returnedBy.rank}</p>
          <p>Handover Date: {returnDate}</p>
          <p>Handover Time: {returnTime}</p>
        </div>

        {/* REMARK */}
        <div className="mb-4">
          <textarea
            placeholder="Enter remark..."
            className="w-full h-20 bg-[#0B1220] border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

           {/* Confirmation */}
          <div className="flex gap-2 text-xs text-gray-400">
            <input type="checkbox" />
            <p>I confirm all Return details are correct.</p>
          </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>

          <button className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700">
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
}
