import { useState, useEffect, useMemo } from "react";
import { returnWeapon, getAllOfficers } from "../../api/weaponApi";
import type { OfficerDTO } from "../../types/weapon";

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

  // ✅ must come from backend
  issuedBulletType?: string | null;
  issuedMagazines?: number | null;
};

type Props = {
  weapon: Weapon;
  onClose: () => void;
};

export default function ReturnWeaponModal({ weapon, onClose }: Props) {
  const [officers, setOfficers] = useState<OfficerDTO[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);
  const [selectedReceivedById, setSelectedReceivedById] = useState<number | null>(null);
  const [returnNote, setReturnNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bullet return states
  const [returnedMagazines, setReturnedMagazines] = useState("");
  const [usedBullets, setUsedBullets] = useState("");
  const [bulletCondition, setBulletCondition] = useState("good");
  const [bulletUsageReason, setBulletUsageReason] = useState("");

  const issuedBulletType = weapon.issuedBulletType ?? "";
  const issuedMagazinesCount = Number(weapon.issuedMagazines ?? 0);

  const bulletsWereIssued = Boolean(issuedBulletType) && issuedMagazinesCount > 0;

  const selectedReceivedBy = useMemo(
    () => officers.find((o) => o.id === selectedReceivedById),
    [officers, selectedReceivedById]
  );

  useEffect(() => {
    loadOfficers();

    // ✅ prefill only if bullets were issued
    if (bulletsWereIssued) {
      setReturnedMagazines(String(issuedMagazinesCount));
    } else {
      setReturnedMagazines("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Issued/Returned officer UI (issuedTo is still display-only)
  const issuedTo: Officer = {
    name: weapon.assignedTo,
    serviceNo: "--",
    rank: "--",
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
      (new Date(returnDate).getTime() - new Date(weapon.dueBack).getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    0
  );

  const returnedCount = returnedMagazines ? Number(returnedMagazines) : 0;
  const usedCount = usedBullets ? Number(usedBullets) : 0;

  // Missing magazines only meaningful if bullets were issued
  const missingMagazines = bulletsWereIssued ? issuedMagazinesCount - returnedCount : 0;

  const bulletsUsed = usedCount > 0;

  const handleReturn = async () => {
    if (!selectedReceivedById) {
      alert("Please select receiving officer");
      return;
    }

    if (!confirmed) {
      alert("Please confirm the details");
      return;
    }

    // ✅ bullet validations only if bullets were issued
    if (bulletsWereIssued) {
      if (returnedMagazines === "") {
        alert("Please enter returned magazines count");
        return;
      }
      if (Number.isNaN(returnedCount) || returnedCount < 0) {
        alert("Returned magazines must be a valid number (>= 0)");
        return;
      }
      if (returnedCount > issuedMagazinesCount) {
        alert(`Returned magazines cannot exceed issued magazines (${issuedMagazinesCount}).`);
        return;
      }
      if (bulletsUsed && !bulletUsageReason.trim()) {
        alert("Please provide a reason for bullet usage");
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = {
        weaponSerial: weapon.serial,
        receivedByUserId: selectedReceivedById,
        returnNote: returnNote || "Returned",
      };

      // ✅ only send bullet fields if bullets were issued
      if (bulletsWereIssued) {
        payload.returnedMagazines = returnedCount;
        payload.usedBullets = bulletsUsed ? usedCount : 0;
        payload.bulletCondition = bulletCondition || "good";
        payload.bulletRemarks = bulletUsageReason?.trim() || "";
      }

      console.log("Returning weapon payload:", payload);

      await returnWeapon(payload);

      alert("Weapon return saved successfully");
      onClose();
    } catch (err: any) {
      console.error("Failed to return weapon:", err);
      // Enhanced error message extraction
      const serverError = err?.response?.data?.error || err?.response?.data?.message;
      const fallbackError = err?.message || "Failed to return weapon";
      alert(`Error: ${serverError || fallbackError}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-hide bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900/90 to-slate-900/90 backdrop-blur-xl border-b border-slate-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Return Weapon & Ammunition</h2>
              <p className="text-sm text-slate-300 mt-1">Complete return process for issued equipment</p>
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
          {/* OVERDUE WARNING */}
          {overdueDays > 0 && (
            <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-l-4 border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold">Overdue Return</p>
                <p className="text-sm">
                  This weapon is overdue by <span className="font-bold">{overdueDays}</span> day(s)
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-6">
              {/* WEAPON INFO */}
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
                      <p className="text-white font-semibold">{weapon.type}</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Serial Number</p>
                      <p className="text-white font-semibold">{weapon.serial}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Issued Date</p>
                      <p className="text-slate-200 text-sm">{weapon.issuedDate}</p>
                    </div>

                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-1">Due Back Date</p>
                      <p className="text-slate-200 text-sm">{weapon.dueBack}</p>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300 mb-2 font-semibold">Return Date & Time</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Date</p>
                        <input
                          value={returnDate}
                          readOnly
                          className="w-full bg-slate-900 border border-slate-600 px-3 py-2 text-xs rounded text-slate-300"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Time</p>
                        <input
                          value={returnTime}
                          readOnly
                          className="w-full bg-slate-900 border border-slate-600 px-3 py-2 text-xs rounded text-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 block mb-2 font-medium">Weapon Return Notes</label>
                    <textarea
                      value={returnNote}
                      onChange={(e) => setReturnNote(e.target.value)}
                      placeholder="Enter any observations about weapon condition, damage, or issues..."
                      className="w-full h-24 bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* OFFICERS */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>👮</span> Personnel Information
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-2 font-medium">Receiving Officer *</label>
                    <select
                      value={selectedReceivedById || ""}
                      onChange={(e) => setSelectedReceivedById(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      disabled={loadingOfficers}
                    >
                      <option value="">{loadingOfficers ? "Loading..." : "-- Select Officer --"}</option>
                      {officers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.serviceId} - {o.name} ({o.rank})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">Issued To</p>
                      <p className="font-semibold text-white text-sm">{issuedTo.name}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {issuedTo.rank} • {issuedTo.serviceNo}
                      </p>
                    </div>

                    <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">Received By</p>
                      <p className="font-semibold text-white text-sm">{returnedBy.name}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {returnedBy.rank} • {returnedBy.serviceNo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT - AMMO */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-800 to-slate-800 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📦</span> Ammunition Return Details
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  {!bulletsWereIssued ? (
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-300">
                      No bullets were issued with this weapon.
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                        <p className="text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2">
                          <span>📋</span> Issued Ammunition
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-900/50 rounded p-2 border border-slate-700">
                            <p className="text-xs text-slate-400">Bullet Type</p>
                            <p className="text-white font-semibold text-sm mt-1">{issuedBulletType}</p>
                          </div>
                          <div className="bg-slate-900/50 rounded p-2 border border-slate-700">
                            <p className="text-xs text-slate-400">Magazines Issued</p>
                            <p className="text-white font-semibold text-sm mt-1">
                              {issuedMagazinesCount} Magazine(s)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-slate-300 block mb-2 font-medium">
                              Magazines Returned *
                            </label>
                            <input
                              type="number"
                              value={returnedMagazines}
                              onChange={(e) => setReturnedMagazines(e.target.value)}
                              placeholder="0"
                              min="0"
                              max={issuedMagazinesCount}
                              className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>

                          <div>
                            <label className="text-sm text-slate-300 block mb-2 font-medium">
                              Bullets Used/Fired
                            </label>
                            <input
                              type="number"
                              value={usedBullets}
                              onChange={(e) => setUsedBullets(e.target.value)}
                              placeholder="0"
                              min="0"
                              className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm text-slate-300 block mb-2 font-medium">
                            Magazine Condition
                          </label>
                          <select
                            value={bulletCondition}
                            onChange={(e) => setBulletCondition(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          >
                            <option value="good">✓ Good Condition</option>
                            <option value="fair">⚠ Fair Condition</option>
                            <option value="damaged">✗ Damaged</option>
                            <option value="lost">⚠ Lost/Missing</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {missingMagazines > 0 && (
                          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <div>
                              <p className="text-red-300 font-semibold text-sm">Missing Magazines</p>
                              <p className="text-red-200 text-xs mt-1">
                                {missingMagazines} magazine(s) not returned from the issued {issuedMagazinesCount}
                              </p>
                            </div>
                          </div>
                        )}

                        {bulletsUsed && (
                          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 flex items-start gap-3">
                            <span className="text-xl">🎯</span>
                            <div>
                              <p className="text-blue-300 font-semibold text-sm">Bullets Discharged</p>
                              <p className="text-blue-200 text-xs mt-1">{usedCount} bullet(s) were used/fired</p>
                            </div>
                          </div>
                        )}

                        {missingMagazines === 0 && returnedMagazines !== "" && (
                          <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 flex items-start gap-3">
                            <span className="text-xl">✓</span>
                            <div>
                              <p className="text-green-300 font-semibold text-sm">All Magazines Returned</p>
                              <p className="text-green-200 text-xs mt-1">
                                All {issuedMagazinesCount} magazine(s) accounted for
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {bulletsUsed && (
                        <div className="bg-blue-900/10 border-2 border-blue-600/50 rounded-lg p-4">
                          <label className="text-sm text-blue-300 block mb-2 font-semibold flex items-center gap-2">
                            <span>⚠️</span> Bullet Usage Justification *
                          </label>
                          <textarea
                            value={bulletUsageReason}
                            onChange={(e) => setBulletUsageReason(e.target.value)}
                            placeholder="Required: Explain why bullets were discharged..."
                            rows={4}
                            className="w-full bg-slate-900 border border-blue-600/50 rounded-lg p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          />
                          <p className="text-xs text-blue-300 mt-2">* Required field when bullets have been used</p>
                        </div>
                      )}
                    </>
                  )}
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
                I confirm that all information provided above is accurate and complete.
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-all font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleReturn}
                disabled={loading || !confirmed}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-blue-900/50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Processing...
                  </span>
                ) : (
                  "Confirm Return"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
