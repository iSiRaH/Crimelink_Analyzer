import React, { useState } from "react";
import { issueWeapon } from "../../api/weaponApi";

const officers = [
  { id: 1, serviceId: "P-1023", name: "A.B.C. Bandara", badge: "4452", role: "OIC" },
  { id: 2, serviceId: "A-5561", name: "J.B. Millawithanachchi", badge: "7811", role: "Investigator" },
  { id: 3, serviceId: "P-7932", name: "Samantha Perera", badge: "3344", role: "Sergeant" },
];

interface Props {
  weapon: any;
  onClose: () => void;
}

const IssueWeaponModal: React.FC<Props> = ({ weapon, onClose }) => {
  const [selectedIssuedToId, setSelectedIssuedToId] = useState<number | null>(null);
  const [selectedHandedOverById, setSelectedHandedOverById] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedIssuedTo = officers.find(o => o.id === selectedIssuedToId);
  const selectedHandedOverBy = officers.find(o => o.id === selectedHandedOverById);

  const now = new Date();
  const issuedDate = now.toISOString().split("T")[0];
  const issuedTime = now.toTimeString().slice(0, 5);

  const handleIssue = async () => {
    if (!selectedIssuedToId || !selectedHandedOverById) {
      alert("Please select both officers");
      return;
    }

    if (!dueDate) {
      alert("Please select a due date");
      return;
    }

    if (!confirmed) {
      alert("Please confirm the details");
      return;
    }

    setLoading(true);

    try {
      await issueWeapon({
        weaponSerial: weapon.serial,
        issuedToId: selectedIssuedToId,
        handedOverById: selectedHandedOverById,
        dueDate,
        issueNote: notes,
      });

      alert("Weapon issued successfully");
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to issue weapon");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedIssuedToId(null);
    setSelectedHandedOverById(null);
    setDueDate("");
    setNotes("");
    setConfirmed(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[450px] max-h-[90vh] overflow-y-auto no-scrollbar rounded-xl bg-[#0f172a] text-gray-200 shadow-xl">
        <div className="flex justify-between px-4 py-3 border-b border-gray-600 backdrop-blur-xl bg-gradient-to-t from-gray-900 to-blue-950">
          <h2 className="text-xl text-white font-semibold">Issue Weapon</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-4 space-y-4">
          <section>
            <h3 className="text-md text-gray-400 mb-1">Issued To Officer</h3>
            <select
              value={selectedIssuedToId || ""}
              onChange={(e) => setSelectedIssuedToId(Number(e.target.value))}
              className="w-full bg-[#020617] border border-gray-700 px-3 py-2 rounded-md text-sm"
            >
              <option value="">Select Officer</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>{o.serviceId} - {o.name}</option>
              ))}
            </select>

            {selectedIssuedTo && (
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <p>Name: {selectedIssuedTo.name}</p>
                <p>Badge: {selectedIssuedTo.badge}</p>
                <p>Role: {selectedIssuedTo.role}</p>
              </div>
            )}
          </section>

          <section>
            <h3 className="text-md text-gray-400 mb-1">Handed Over By</h3>
            <select
              value={selectedHandedOverById || ""}
              onChange={(e) => setSelectedHandedOverById(Number(e.target.value))}
              className="w-full bg-[#020617] border border-gray-700 px-3 py-2 rounded-md text-sm"
            >
              <option value="">Select Officer</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>{o.serviceId} - {o.name}</option>
              ))}
            </select>

            {selectedHandedOverBy && (
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <p>Name: {selectedHandedOverBy.name}</p>
                <p>Badge: {selectedHandedOverBy.badge}</p>
                <p>Role: {selectedHandedOverBy.role}</p>
              </div>
            )}
          </section>

          <section>
       
          </section>

          <section className="border border-2 p-1 pb-4 bg-gray-800 rounded-md border-gray-700">
            <h3 className="text-md text-center text-gray-200">Issue Information</h3>

            <div className="grid grid-cols-2 gap-6 pb-3">
              <div>
                <span className="text-sm text-gray-400">Issued Date</span>
                <input
                  value={issuedDate}
                  readOnly
                  className="bg-gray-900 border border-gray-700 px-3 py-2 text-xs rounded text-gray-400 w-full"
                />
              </div>
              <div>
                <span className="text-sm text-gray-400">Issued Time</span>
                <input
                  value={issuedTime}
                  readOnly
                  className="bg-gray-900 border border-gray-700 px-3 py-2 text-xs rounded text-gray-400 w-full"
                />
              </div>
            </div>

                 <h3 className="text-md text-gray-400 mb-1">Weapon Details</h3>
            <div className="bg-[#020617] border border-gray-700 rounded-md p-3 text-sm space-y-2 grid grid-cols-2 gap-6">
              <div>
                  <p>
                    <span className="text-gray-400">Weapon :</span>{" "}
                    <span className="text-white">{weapon?.type}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Serial :</span>{" "}
                    <span className="text-white">{weapon?.serial}</span>
                  </p>
              </div>
              <div>
                  <p className="text-green-400 font-semibold">Status : Available</p>
              </div>
              
            </div>

        
          </section>

          <div className="grid grid-cols-2 pt-2 items-center">
            <span>Add Due Date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-gray-200 text-sm text-center rounded-lg border bg-gray-700 px-2 py-2"
            />
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            rows={3}
            className="w-full rounded-md bg-[#020617] border border-gray-700 px-3 py-2 text-xs"
          />

          <div className="flex gap-2 text-xs text-gray-400">
            <input 
              type="checkbox" 
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <p>I confirm all issue details are correct.</p>
          </div>

          <div className="flex gap-5">
            <button 
              onClick={handleReset}
              className="w-1/2 border py-2 rounded-md text-sm font-semibold hover:bg-blue-500"
            >
              Reset
            </button>
            <button
              onClick={handleIssue}
              disabled={loading}
              className="w-1/2 bg-blue-800 py-2 rounded-md text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Issue Weapon"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueWeaponModal;