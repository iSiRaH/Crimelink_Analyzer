import React, { useState } from "react";

const officers = [
  {
    id: "P-1023",
    name: "A.B.C. Bandara",
    type: "Police",
    badge: "4452",
    duty: "Patrol A",
  },
  {
    id: "A-5561",
    name: "J.B. Millawithanachchi",
    type: "Army",
    badge: "7811",
    duty: "Guard Duty",
  },
];

const IssueWeaponModal: React.FC = () => {
  const [selectedOfficerId, setSelectedOfficerId] = useState("");

  const selectedOfficer = officers.find(
    (o) => o.id === selectedOfficerId
  );

  const now = new Date();
  const issuedDate = now.toISOString().split("T")[0];
  const issuedTime = now.toTimeString().slice(0, 5);

  const handleIssue = () => {
    if (!selectedOfficer) {
      alert("Please select an officer");
      return;
    }

    console.log("Weapon Issued:", {
      officerId: selectedOfficer.id,
      officerName: selectedOfficer.name,
      weapon: "Glock 17",
      serial: "G17-998A",
      issuedDate,
      issuedTime,
    });

    alert("Weapon issued successfully!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="w-[380px] rounded-xl bg-[#0f172a] text-gray-200 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold">Issue Weapon</h2>
          <button className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">

          {/* Officer Details */}
          <section>
            <h3 className="text-xs text-gray-400 mb-1">Officer Details</h3>

            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="w-full bg-[#020617] border border-gray-700 px-3 py-2 rounded-md text-sm"
            >
              <option value="">Select Officer ID</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id} ({o.type})
                </option>
              ))}
            </select>

            {selectedOfficer && (
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <p>Name: {selectedOfficer.name}</p>
                <p>Type: {selectedOfficer.type}</p>
                <p>Badge: {selectedOfficer.badge}</p>
                <p>Duty: {selectedOfficer.duty}</p>
              </div>
            )}
          </section>

          {/* Weapon Details */}
          <section>
            <h3 className="text-xs text-gray-400 mb-1">Weapon Details</h3>

            <div className="bg-[#020617] border border-gray-700 rounded-md p-3 text-sm">
              <p>Weapon: Glock 17</p>
              <p className="text-gray-400">Serial: G17-998A</p>
              <p className="text-green-400">Status: Available</p>
            </div>
          </section>

          {/* Issue Info */}
          <section>
            <h3 className="text-xs text-gray-400 mb-1">Issue Information</h3>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={issuedDate}
                readOnly
                className="bg-[#020617] border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
              />
              <input
                type="time"
                value={issuedTime}
                readOnly
                className="bg-[#020617] border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
              />
            </div>

            <textarea
              placeholder="Notes"
              rows={3}
              className="w-full mt-2 bg-[#020617] border border-gray-700 px-3 py-2 text-xs rounded"
            />
          </section>

          {/* Confirmation */}
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <input type="checkbox" className="mt-1" />
            <p>
              I confirm the weapon is issued to the above officer and all details
              are correct.
            </p>
          </div>

          {/* Action */}
          <button
            onClick={handleIssue}
            className="w-full bg-blue-600 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition"
          >
            Issue Weapon
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueWeaponModal;
