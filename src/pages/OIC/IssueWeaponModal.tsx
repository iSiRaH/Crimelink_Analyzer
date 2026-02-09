import React, { useState, useEffect } from "react";
import { issueWeapon, getAllOfficers } from "../../api/weaponApi";
import type { OfficerDTO } from "../../types/weapon";

interface Props {
  weapon: any;
  onClose: () => void;
}

const IssueWeaponModal: React.FC<Props> = ({ weapon, onClose }) => {
  const [officers, setOfficers] = useState<OfficerDTO[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [selectedIssuedToId, setSelectedIssuedToId] = useState<number | null>(null);
  const [selectedHandedOverById, setSelectedHandedOverById] = useState<number | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bullet states
  const [bulletType, setBulletType] = useState("");
  const [numberOfMagazines, setNumberOfMagazines] = useState("");
  const [bulletRemarks, setBulletRemarks] = useState("");

  const selectedIssuedTo = officers.find(o => o.id === selectedIssuedToId);
  const selectedHandedOverBy = officers.find(o => o.id === selectedHandedOverById);

  useEffect(() => {
    loadOfficers();
  }, []);

  const loadOfficers = async () => {
    try {
      const response = await getAllOfficers();
      setOfficers(response.data);
    } catch (err) {
      console.error("Failed to load officers:", err);
      alert("Failed to load officers. Please try again.");
    } finally {
      setLoadingOfficers(false);
    }
  };

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
        // Include bullet information if provided
        bulletType: bulletType || undefined,
        numberOfMagazines: numberOfMagazines ? Number(numberOfMagazines) : undefined,
        bulletRemarks: bulletRemarks || undefined,
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
    setBulletType("");
    setNumberOfMagazines("");
    setBulletRemarks("");
    setConfirmed(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-hide bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700">
      

        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900/90 to-slate-900/90 backdrop-blur-xl border-b border-slate-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Issue Weapon & Ammunition</h2>
              <p className="text-sm text-slate-300 mt-1">Complete issue process for weapon and bullets</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white transition-colors text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* MAIN GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN - WEAPON SECTION */}
            <div className="space-y-6">
              
              {/* WEAPON INFORMATION CARD */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>🔫</span> Weapon Information
                  </h3>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Weapon Type</p>
                      <p className="text-white font-semibold">{weapon?.type}</p>
                    </div>
                    
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Serial Number</p>
                      <p className="text-white font-semibold">{weapon?.serial}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Status</p>
                    <p className="text-green-400 font-semibold">Available</p>
                  </div>

                  {/* Issue Date & Time */}
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300 mb-2 font-semibold">Issue Date & Time</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Date</p>
                        <input
                          value={issuedDate}
                          readOnly
                          className="w-full bg-slate-900 border border-slate-600 px-3 py-2 text-xs rounded text-slate-300"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Time</p>
                        <input
                          value={issuedTime}
                          readOnly
                          className="w-full bg-slate-900 border border-slate-600 px-3 py-2 text-xs rounded text-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="text-sm text-slate-300 block mb-2 font-medium">Due Date *</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* General Notes */}
                  <div>
                    <label className="text-sm text-slate-300 block mb-2 font-medium">General Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Additional issue notes..."
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* OFFICER INFORMATION */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>👮</span> Personnel Information
                  </h3>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Issued To Officer */}
                  <div>
                    <label className="text-sm text-slate-300 block mb-2 font-medium">Issued To Officer *</label>
                    <select
                      value={selectedIssuedToId || ""}
                      onChange={(e) => setSelectedIssuedToId(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      disabled={loadingOfficers}
                    >
                      <option value="">{loadingOfficers ? "Loading..." : "-- Select Officer --"}</option>
                      {officers.map(o => (
                        <option key={o.id} value={o.id}>{o.serviceId} - {o.name}</option>
                      ))}
                    </select>

                    {selectedIssuedTo && (
                      <div className="mt-2 bg-slate-900/70 rounded-lg p-3 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-2">Officer Details</p>
                        <p className="font-semibold text-white text-sm">{selectedIssuedTo.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedIssuedTo.role} • {selectedIssuedTo.badge}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Handed Over By */}
                  <div>
                    <label className="text-sm text-slate-300 block mb-2 font-medium">Handed Over By *</label>
                    <select
                      value={selectedHandedOverById || ""}
                      onChange={(e) => setSelectedHandedOverById(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      disabled={loadingOfficers}
                    >
                      <option value="">{loadingOfficers ? "Loading..." : "-- Select Officer --"}</option>
                      {officers.map(o => (
                        <option key={o.id} value={o.id}>{o.serviceId} - {o.name}</option>
                      ))}
                    </select>

                    {selectedHandedOverBy && (
                      <div className="mt-2 bg-slate-900/70 rounded-lg p-3 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-2">Officer Details</p>
                        <p className="font-semibold text-white text-sm">{selectedHandedOverBy.name}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedHandedOverBy.role} • {selectedHandedOverBy.badge}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - AMMUNITION SECTION */}
            <div className="space-y-6">
              
              {/* AMMUNITION ISSUE CARD */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-800 to-slate-800 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📦</span> Ammunition Issue Details
                  </h3>
                </div>
                
                <div className="p-4 space-y-4">
                  
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                      <span>📋</span> Ammunition Information
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-slate-300 block mb-2 font-medium">Bullet Type</label>
                        <input
                          type="text"
                          value={bulletType}
                          onChange={(e) => setBulletType(e.target.value)}
                          placeholder="e.g., 9mm, .45 ACP"
                          className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-300 block mb-2 font-medium">Number of Magazines</label>
                        <input
                          type="number"
                          value={numberOfMagazines}
                          onChange={(e) => setNumberOfMagazines(e.target.value)}
                          placeholder="Enter quantity"
                          min="0"
                          className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-slate-300 block mb-2 font-medium">Ammunition Remarks</label>
                        <textarea
                          value={bulletRemarks}
                          onChange={(e) => setBulletRemarks(e.target.value)}
                          placeholder="Additional notes about ammunition/magazines..."
                          rows={4}
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ISSUE SUMMARY */}
                  {(bulletType || numberOfMagazines) && (
                    <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3 flex items-start gap-3">
                      <span className="text-xl">✓</span>
                      <div>
                        <p className="text-green-300 font-semibold text-sm">Ammunition to be Issued</p>
                        <p className="text-green-200 text-xs mt-1">
                          {numberOfMagazines || "0"} magazine(s) of {bulletType || "unspecified type"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* INFO BOX */}
                  <div className="bg-blue-900/10 border border-blue-600/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300">
                      <span className="font-semibold">ℹ️ Note:</span> Ensure all ammunition details are accurate. 
                      This information will be required during the return process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CONFIRMATION & ACTIONS */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
            <div className="flex items-start gap-3 mb-5">
              <input 
                type="checkbox" 
                id="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900"
              />
              <label htmlFor="confirm" className="text-sm text-slate-300 cursor-pointer">
                I confirm that all information provided above is accurate and complete. I have verified the weapon details, 
                ammunition count, officer information, and all issue details are correct to the best of my knowledge.
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 px-6 py-3 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-all font-semibold"
              >
                Reset
              </button>

              <button
                onClick={handleIssue}
                disabled={loading || !confirmed}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-blue-900/50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Processing...
                  </span>
                ) : (
                  "Issue Weapon & Ammunition"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueWeaponModal;