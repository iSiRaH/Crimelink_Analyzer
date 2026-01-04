import React, { useState } from "react";
import { returnWeapon } from "../../api/weaponApi";

const officers = [
  { id: 1, serviceId: "P-1023", name: "A.B.C. Bandara", badge: "4452", role: "OIC", rank: "Inspector" },
  { id: 2, serviceId: "A-5561", name: "J.B. Millawithanachchi", badge: "7811", role: "Investigator", rank: "Sub Inspector" },
  { id: 3, serviceId: "P-7932", name: "Samantha Perera", badge: "3344", role: "Sergeant", rank: "Sergeant" },
];

type Officer = {
  name: string;
  serviceNo: string;
  rank: string;
};

type Weapon = {
  type: string;
  serial: string;
  issuedDate: string;
  dueBack: string;
  assignedTo: string;
};

type Props = {
  weapon: Weapon;
  onClose: () => void;
};

export default function ReturnWeaponModal({ weapon, onClose }: Props) {
  const [selectedReceivedById, setSelectedReceivedById] = useState<number | null>(null);
  const [returnNote, setReturnNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedReceivedBy = officers.find(o => o.id === selectedReceivedById);

  /* MOCK – normally from backend */
  const issuedTo: Officer = {
    name: weapon.assignedTo,
    serviceNo: "P-3841",
    rank: "Sergeant",
  };

  const returnedBy: Officer = {
    name: selectedReceivedBy?.name || "Select Officer",
    serviceNo: selectedReceivedBy?.serviceId || "--",
    rank: selectedReceivedBy?.rank || "--",
  };

  /* AUTO DATE & TIME */
  const now = new Date();
  const returnDate = now.toISOString().split("T")[0];
  const returnTime = now.toTimeString().slice(0, 5);

  /* OVERDUE CALCULATION */
  const overdueDays = Math.max(
    Math.floor(
      (new Date(returnDate).getTime() -
        new Date(weapon.dueBack).getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    0
  );

  const handleReturn = async () => {
    if (!selectedReceivedById) {
      alert("Please select receiving officer");
      return;
    }

    if (!confirmed) {
      alert("Please confirm the details");
      return;
    }

    setLoading(true);

    try {
      await returnWeapon({
        weaponSerial: weapon.serial,
        receivedByUserId: selectedReceivedById,
        returnNote: returnNote || "Returned",
      });

      alert("Weapon returned successfully");
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to return weapon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="w-[450px] backdrop-blur-xl text-white rounded-xl border border-gray-700 shadow-xl p-5">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Return Weapon</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">
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
          <div className="grid grid-cols-2">
            <p>Weapon: <span className="text-white">{weapon.type}</span></p>
            <p>Serial No: <span className="text-white">{weapon.serial}</span></p>
          </div>
          <div className="grid grid-cols-2">
            <p>Issued Date: {weapon.issuedDate}</p>
            <p>Due Back Date: {weapon.dueBack}</p>
          </div>
        </div>

        {/* SELECT RECEIVING OFFICER */}
        <div className="mb-3">
          <label className="text-sm text-gray-400 mb-1 block">Select Receiving Officer</label>
          <select
            value={selectedReceivedById || ""}
            onChange={(e) => setSelectedReceivedById(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 px-3 py-2 rounded text-sm"
          >
            <option value="">-- Select Officer --</option>
            {officers.map(o => (
              <option key={o.id} value={o.id}>
                {o.serviceId} - {o.name} ({o.rank})
              </option>
            ))}
          </select>
        </div>

        {/* OFFICERS */}
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

        {/* RETURN DATE & TIME */}
        <span className="text-md text-gray-300">Return Date & Time</span>

        <div className="flex gap-5 mb-4">
          <div className="w-1/2">
            <span className="text-sm text-gray-400">Returned Date</span>
            <input
              value={returnDate}
              readOnly
              className="bg-gray-900 w-full border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
            />
          </div>

          <div className="w-1/2">
            <span className="text-sm text-gray-400">Returned Time</span>
            <input
              value={returnTime}
              readOnly
              className="bg-gray-900 w-full border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
            />
          </div>
        </div>

        {/* REMARK */}
        <textarea
          value={returnNote}
          onChange={(e) => setReturnNote(e.target.value)}
          placeholder="Enter remark..."
          className="w-full h-20 bg-[#0B1220] border border-gray-600 rounded-md p-2 text-sm focus:outline-none focus:border-blue-500 mb-4"
        />

        {/* CONFIRM */}
        <div className="flex gap-2 text-xs text-gray-400 mb-5">
          <input 
            type="checkbox" 
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <p>I confirm all Return details are correct.</p>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-5">
          <button
            onClick={onClose}
            className="w-1/2 px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800"
          >
            Cancel
          </button>

          <button
            onClick={handleReturn}
            disabled={loading}
            className="w-1/2 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Return"}
          </button>
        </div>

      </div>
    </div>
  );
}