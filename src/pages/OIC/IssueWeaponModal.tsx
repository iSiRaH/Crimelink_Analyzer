import React, { useEffect, useState } from "react";

/* Mock officer data */
const officers = [
  { id: "P-1023", name: "A.B.C. Bandara", badge: "4452", role: "OIC" },
  { id: "A-5561", name: "J.B. Millawithanachchi", badge: "7811", role: "Investigator" },
];

interface Props {
  weapon: any;
  onClose: () => void;
}

const IssueWeaponModal: React.FC<Props> = ({ weapon, onClose }) => {

  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const selectedOfficer = officers.find(o => o.id === selectedOfficerId);

  const now = new Date();
  const issuedDate = now.toISOString().split("T")[0];
  const issuedTime = now.toTimeString().slice(0, 5);

  const handleIssue = () => {
    if (!selectedOfficer || !weapon) {
      alert("Please select officer");
      return;
    }

    const payload = {
      weaponSerial: weapon.serial,
      weaponType: weapon.type,
      officerId: selectedOfficer.id,
      issuedDate,
      issuedTime,
      dueDate,
      notes,
    };

    console.log("ISSUE PAYLOAD", payload);
    alert("Weapon issued successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="w-[450px] max-h-[90vh] overflow-y-auto no-scrollbar rounded-xl bg-[#0f172a] text-gray-200 shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between px-4 py-3 border-b border-gray-600 backdrop-blur-xl bg-gradient-to-t from-gray-900 to-blue-950">
          <h2 className="text-xl text-white font-semibold">Issue Weapon</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-4 space-y-4">

          {/* OFFICER DETAILS */}
          <section>
            <h3 className="text-md text-gray-400 mb-1">Officer Details</h3>

            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="w-full bg-[#020617] border border-gray-700 px-3 py-2 rounded-md text-sm"
            >
              <option value="">Select Officer ID</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>{o.id}</option>
              ))}
            </select>

            {selectedOfficer && (
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <p>Name: {selectedOfficer.name}</p>
                <p>Badge: {selectedOfficer.badge}</p>
                <p>Role: {selectedOfficer.role}</p>
              </div>
            )}
          </section>

          {/* WEAPON DETAILS (READ ONLY) */}
          <section>
            <h3 className="text-md text-gray-400 mb-1">Weapon Details</h3>

            <div className="bg-[#020617] border border-gray-700 rounded-md p-3 text-sm space-y-2">
              <p>
                <span className="text-gray-400">Weapon :</span>{" "}
                <span className="text-white">{weapon?.type}</span>
              </p>
              <p>
                <span className="text-gray-400">Serial :</span>{" "}
                <span className="text-white">{weapon?.serial}</span>
              </p>
              <p className="text-green-400 font-semibold">
                Status : Available
              </p>
            </div>
          </section>

          {/* ISSUE INFORMATION */}
          <section className="border border-2 p-1 pb-4 bg-gray-800 rounded-md border-gray-700">
            <h3 className="text-md text-center text-gray-200">Issue Information</h3>

            <div className="grid grid-cols-2 gap-6 pb-3">
              <div>
                <span className="text-sm text-gray-400">Issued Date</span>
                <input
                  value={issuedDate}
                  readOnly
                  className="bg-gray-900 border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
                />
              </div>
              <div>
                <span className="text-sm text-gray-400">Issued Time</span>
                <input
                  value={issuedTime}
                  readOnly
                  className="bg-gray-900 border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pb-3">
              <div>
                <h3 className="text-sm text-gray-400">Officer Name</h3>
                <input
                  value={selectedOfficer?.name || ""}
                  readOnly
                  className="bg-gray-900 border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
                />
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Officer ID</h3>
                <input
                  value={selectedOfficer?.id || ""}
                  readOnly
                  className="bg-gray-900 border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
                />
              </div>
            </div>
          </section>

          {/* DUE DATE */}
          <div className="grid grid-cols-2 pt-2">
            <span>Add Due Date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-gray-500 text-sm text-center rounded-lg border bg-gray-900"
            />
          </div>

          {/* NOTES */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            rows={3}
            className="w-full rounded-md bg-[#020617] border border-gray-700 px-3 py-2 text-xs"
          />

          {/* CONFIRM */}
          <div className="flex gap-2 text-xs text-gray-400">
            <input type="checkbox" />
            <p>I confirm all issue details are correct.</p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-5">
            <button className="w-1/2 border py-2 rounded-md text-sm font-semibold hover:bg-blue-500">
              Reset
            </button>
            <button
              onClick={handleIssue}
              className="w-1/2 bg-blue-800 py-2 rounded-md text-sm font-semibold hover:bg-blue-500"
            >
              Issue Weapon
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IssueWeaponModal;
