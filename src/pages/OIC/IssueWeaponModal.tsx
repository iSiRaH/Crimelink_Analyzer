import React, { useState } from "react";

/* Mock officer data */
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

/* Mock weapon data */
const weapons = [
  {
    serial: "G17-998A",
    name: "Glock 17",
    status: "Available",
  },
  {
    serial: "AK-4471",
    name: "AK 47",
    status: "Not Available",
  },
];

const IssueWeaponModal: React.FC = () => {
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [selectedWeaponSerial, setSelectedWeaponSerial] = useState("");

  const selectedOfficer = officers.find(o => o.id === selectedOfficerId);
  const selectedWeapon = weapons.find(w => w.serial === selectedWeaponSerial);

  const now = new Date();
  const issuedDate = now.toISOString().split("T")[0];
  const issuedTime = now.toTimeString().slice(0, 5);

  const handleIssue = () => {
    if (!selectedOfficer || !selectedWeapon) {
      alert("Please select officer and weapon");
      return;
    }

    console.log("Weapon Issued:", {
      officer: selectedOfficer,
      weapon: selectedWeapon,
      issuedDate,
      issuedTime,
    });

    alert("Weapon issued successfully!");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="w-[400px] max-h-[90vh] overflow-y-auto no-scrollbar rounded-xl bg-[#0f172a] text-gray-200 shadow-xl">



        {/* Header */}
        <div className="flex justify-between px-4 py-3 border-b border-gray-600 ">
          <h2 className="text-xl text-white font-semibold ">Issue Weapon</h2>
          <button className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-4 space-y-4">

          {/* Officer Details */}
          <section>
            <h3 className="text-md text-gray-400 mb-1">Officer Details</h3>

            <select
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
              className="w-full bg-[#020617] border border-gray-700 px-3 py-2 rounded-md text-sm"
            >
              <option value="">Select Officer ID</option>
              {officers.map(o => (
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
            <h3 className="text-md text-gray-400 mb-1">Weapon Details</h3>

            <select
              value={selectedWeaponSerial}
              onChange={(e) => setSelectedWeaponSerial(e.target.value)}
              className="w-full bg-[#020617] border border-gray-700 px-3 py-2 rounded-md text-sm"
            >
              <option value="">Select Weapon Serial</option>
              {weapons.map(w => (
                <option key={w.serial} value={w.serial}>
                  {w.serial}
                </option>
              ))}
            </select>

            {selectedWeapon && (
  <div className="mt-2 text-xs text-gray-400 space-y-1 flex flex-row justify-between">
    <div>
      <p>Weapon: {selectedWeapon.name}</p>
      <p>Serial: {selectedWeapon.serial}</p>
    </div>

    <div>
      <p
        className={`text-lg font-semibold ${
          selectedWeapon.status === "Available"
            ? "text-green-400"
            : "text-red-400"
        }`}
      >
        Status:{" "}
        {selectedWeapon.status === "Available"
          ? "Available"
          : "Not Available"}
      </p>
    </div>
  </div>
)}

          </section>

          {/* Issue Info */}
        <section className="border border-2 p-1 pb-4 bg-gray-800 rounded-md border-gray-700">
            <h3 className="text-md text-center mb-1 text-gray-200 mb-1">Issue Information</h3>
            <div className="grid grid-cols-2 gap-6 pb-3">
                <div className="">
                    <span className="text-sm text-gray-400 ">Issued Date</span>
                    <input
                        value={issuedDate}
                        readOnly
                        className="bg-gray-900 border  border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
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
                        value={issuedTime}
                        readOnly
                        className="bg-gray-900 border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
                    />
                </div>
                <div>
                       <h3 className="text-sm text-gray-400">Officer ID</h3>
                    <input
                        value={issuedTime}
                        readOnly
                        className="bg-gray-900 border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
                    />
                </div>
                
            </div>
        </section>
          <textarea
              placeholder="Notes"
              rows={3}
              className="w-full rounded-md bg-[#020617] border border-gray-700 px-3 py-2 text-xs"
            />

          {/* Confirmation */}
          <div className="flex gap-2 text-xs text-gray-400">
            <input type="checkbox" />
            <p>I confirm all issue details are correct.</p>
          </div>

          {/* Action */}
          <div className="w-full flex flex-row gap-5">
            <button
                onClick={"RestForm"}
                className="w-1/2 border border-bg-blue-700 py-2 rounded-md text-sm font-semibold hover:bg-blue-500"
            >
                Reset
            </button>
            <button
                onClick={handleIssue}
                className="w-1/2 bg-blue-700 py-2 rounded-md text-sm font-semibold hover:bg-blue-500"
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
