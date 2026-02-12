import React, { useEffect, useMemo, useState } from "react";
import { issueWeapon, getAllOfficers } from "../../api/weaponApi";
import { getAllBulletsWithDetails } from "../../api/BulletApi";
import type { OfficerDTO } from "../../types/weapon";

/** Must match backend BulletResponseDTO fields */
type BulletStock = {
  bulletId: number;
  bulletType: string;
  numberOfMagazines: number;
  remarks?: string;
};

interface Props {
  weapon: {
    type: string;
    serial: string;
  };
  onClose: () => void;
}

const IssueWeaponModal: React.FC<Props> = ({ weapon, onClose }) => {
  const [officers, setOfficers] = useState<OfficerDTO[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(true);

  const [bullets, setBullets] = useState<BulletStock[]>([]);
  const [loadingBullets, setLoadingBullets] = useState(true);

  const [selectedIssuedToId, setSelectedIssuedToId] = useState<number | "">("");
  const [selectedHandedOverById, setSelectedHandedOverById] = useState<number | "">("");

  const [dueDate, setDueDate] = useState("");
  const [issueNote, setIssueNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Bullet issue fields
  const [bulletType, setBulletType] = useState<string>(""); // selected bullet type from DB
  const [numberOfMagazines, setNumberOfMagazines] = useState<string>(""); // magazines to issue
  const [bulletRemarks, setBulletRemarks] = useState<string>(""); // note

  const selectedIssuedTo = useMemo(
    () =>
      officers.find(
        (o) => o.id === (typeof selectedIssuedToId === "number" ? selectedIssuedToId : -1)
      ),
    [officers, selectedIssuedToId]
  );

  const selectedHandedOverBy = useMemo(
    () =>
      officers.find(
        (o) => o.id === (typeof selectedHandedOverById === "number" ? selectedHandedOverById : -1)
      ),
    [officers, selectedHandedOverById]
  );

  const selectedBullet = useMemo(
    () => bullets.find((b) => b.bulletType === bulletType),
    [bullets, bulletType]
  );

  const bulletsWereSelected = Boolean(bulletType);

  // ✅ Real-time qty parse
  const enteredQty = numberOfMagazines ? Number(numberOfMagazines) : 0;

  // ✅ Stock check (THIS FIXES YOUR SCREENSHOT ISSUE)
  const availableStock = selectedBullet?.numberOfMagazines ?? 0;

  const exceedsStock =
    bulletsWereSelected &&
    Number.isFinite(enteredQty) &&
    enteredQty > availableStock;

  const invalidQty =
    bulletsWereSelected &&
    (!numberOfMagazines ||
      Number.isNaN(enteredQty) ||
      enteredQty <= 0);

  const now = new Date();
  const issuedDate = now.toISOString().split("T")[0];
  const issuedTime = now.toTimeString().slice(0, 5);

  useEffect(() => {
    loadOfficers();
    loadBullets();
  }, []);

  const loadOfficers = async () => {
    try {
      const res = await getAllOfficers();
      setOfficers(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load officers");
    } finally {
      setLoadingOfficers(false);
    }
  };

  const loadBullets = async () => {
    try {
      const res = await getAllBulletsWithDetails();
      setBullets(res.data);
    } catch (e) {
      console.error(e);
      alert("Failed to load bullets inventory");
    } finally {
      setLoadingBullets(false);
    }
  };

  const handleReset = () => {
    setSelectedIssuedToId("");
    setSelectedHandedOverById("");
    setDueDate("");
    setIssueNote("");

    setBulletType("");
    setNumberOfMagazines("");
    setBulletRemarks("");

    setConfirmed(false);
  };

  const handleIssue = async () => {
    if (selectedIssuedToId === "" || selectedHandedOverById === "") {
      alert("Please select both officers");
      return;
    }
    if (!dueDate) {
      alert("Please select due date");
      return;
    }
    if (!confirmed) {
      alert("Please confirm the details");
      return;
    }

    // ✅ Bullet validations (only when bulletType selected)
    if (bulletsWereSelected) {
      if (!selectedBullet) {
        alert("Selected bullet type not found");
        return;
      }

      if (invalidQty) {
        alert("Enter a valid number of magazines (must be > 0)");
        return;
      }

      if (exceedsStock) {
        alert(`Cannot issue ${enteredQty}. Only ${availableStock} magazines available.`);
        return;
      }
    }

    setLoading(true);
    try {
      await issueWeapon({
        weaponSerial: weapon.serial,
        issuedToId: selectedIssuedToId,
        handedOverById: selectedHandedOverById,
        dueDate,
        issueNote,

        // ✅ Bullet payload (only if selected)
        bulletType: bulletsWereSelected ? bulletType : undefined,
        numberOfMagazines: bulletsWereSelected ? enteredQty : undefined,
        bulletRemarks: bulletsWereSelected ? (bulletRemarks.trim() || undefined) : undefined,
      });

      // ✅ refresh stock after issue
      await loadBullets();

      alert("Weapon issued successfully");
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.error || err?.message || "Failed to issue weapon");
    } finally {
      setLoading(false);
    }
  };

  // ✅ disable button when qty invalid or exceeds stock
  const disableIssueButton =
    loading ||
    !confirmed ||
    selectedIssuedToId === "" ||
    selectedHandedOverById === "" ||
    !dueDate ||
    (bulletsWereSelected && (invalidQty || exceedsStock));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-hide bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900/90 to-slate-900/90 backdrop-blur-xl border-b border-slate-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Issue Weapon & Ammunition</h2>
              <p className="text-sm text-slate-300 mt-1">Bullets are loaded from database</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT */}
            <div className="space-y-6">
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

                  <div>
                    <label className="text-sm text-slate-300 block mb-2 font-medium">Due Date *</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 block mb-2 font-medium">Issue Note</label>
                    <textarea
                      value={issueNote}
                      onChange={(e) => setIssueNote(e.target.value)}
                      placeholder="Issue note..."
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white"
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
                    <label className="text-sm text-slate-300 block mb-2 font-medium">Issued To *</label>
                    <select
                      value={selectedIssuedToId}
                      onChange={(e) => setSelectedIssuedToId(Number(e.target.value))}
                      disabled={loadingOfficers}
                      className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white"
                    >
                      <option value="">{loadingOfficers ? "Loading..." : "-- Select Officer --"}</option>
                      {officers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.serviceId} - {o.name} ({o.rank})
                        </option>
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

                  <div>
                    <label className="text-sm text-slate-300 block mb-2 font-medium">Handed Over By *</label>
                    <select
                      value={selectedHandedOverById}
                      onChange={(e) => setSelectedHandedOverById(Number(e.target.value))}
                      disabled={loadingOfficers}
                      className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white"
                    >
                      <option value="">{loadingOfficers ? "Loading..." : "-- Select Officer --"}</option>
                      {officers.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.serviceId} - {o.name} ({o.rank})
                        </option>
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

            {/* RIGHT - BULLETS */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-800 to-slate-800 px-4 py-3">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>📦</span> Bullet Issue (DB)
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-2 font-medium">Bullet Type</label>
                    <select
                      value={bulletType}
                      onChange={(e) => {
                        setBulletType(e.target.value);
                        setNumberOfMagazines("");
                        setBulletRemarks("");
                      }}
                      disabled={loadingBullets}
                      className="w-full bg-slate-900 border border-slate-600 px-3 py-2.5 rounded-lg text-sm text-white"
                    >
                      <option value="">{loadingBullets ? "Loading..." : "-- No Bullets --"}</option>
                      {bullets.map((b) => (
                        <option key={b.bulletId} value={b.bulletType}>
                          {b.bulletType} (Available: {b.numberOfMagazines})
                        </option>
                      ))}
                    </select>
                  </div>

                  {bulletType && (
                    <>
                      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm">
                        Available magazines: <b>{availableStock}</b>
                      </div>

                      <div>
                        <label className="text-sm text-slate-300 block mb-2 font-medium">
                          Magazines to Issue
                        </label>
                        <input
                          type="number"
                          value={numberOfMagazines}
                          onChange={(e) => setNumberOfMagazines(e.target.value)}
                          min={1}
                          className={`w-full px-3 py-2.5 rounded-lg text-sm text-white border
                            ${
                              exceedsStock
                                ? "bg-red-900/40 border-red-500"
                                : "bg-slate-900 border-slate-600"
                            }`}
                        />

                        {invalidQty && (
                          <p className="text-red-400 text-xs mt-1">
                            Enter a valid number (must be greater than 0).
                          </p>
                        )}

                        {exceedsStock && (
                          <p className="text-red-400 text-xs mt-1">
                            Cannot issue more than available magazines ({availableStock})
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm text-slate-300 block mb-2 font-medium">Bullet Note</label>
                        <textarea
                          value={bulletRemarks}
                          onChange={(e) => setBulletRemarks(e.target.value)}
                          rows={4}
                          placeholder="Ex: training ammo / duty ammo / batch info..."
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-5">
            <div className="flex items-start gap-3 mb-5">
              <input
                type="checkbox"
                id="confirmIssue"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900"
              />
              <label htmlFor="confirmIssue" className="text-sm text-slate-300 cursor-pointer">
                I confirm that all information provided above is accurate.
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
                disabled={disableIssueButton}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                {loading ? "Processing..." : "Issue Weapon"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueWeaponModal;
