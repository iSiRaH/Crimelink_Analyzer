import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addWeapon,
  updateWeapon,
  getAllWeapons,
} from "../../api/weaponApi";
import {
  addBullet,
  updateBullet,
  getAllBullets,
} from "../../api/BulletApi";
import {
  ArrowLeft,
  PlusCircle,
  RefreshCcw,
  CheckCircle,
} from "lucide-react";

/* ================= TYPES ================= */

type Props = {
  onBack: () => void;
};

type Weapon = {
  serialNumber: string;
  weaponType: string;
  remarks?: string;
  status: string;
};

type Bullet = {
  bulletId?: number;
  bulletType: string;
  numberOfMagazines: number;
  remarks?: string;
};

/* ================= COMPONENT ================= */

export default function ManageWeapon({ onBack }: Props) {
  const navigate = useNavigate();
  const [weaponMode, setWeaponMode] = useState<"add" | "update">("add");
  const [bulletMode, setBulletMode] = useState<"add" | "update">("add");

  // Weapon states
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  const [weaponType, setWeaponType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [weaponRegisterDate, setWeaponRegisterDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Bullet states
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [selectedBullet, setSelectedBullet] = useState<Bullet | null>(null);
  const [bulletType, setBulletType] = useState("");
  const [numberOfMagazines, setNumberOfMagazines] = useState("");
  const [bulletRemarks, setBulletRemarks] = useState("");
  const [bulletRegisterDate, setBulletRegisterDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState("");

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadWeapons();
    loadBullets();
  }, []);

  const loadWeapons = async () => {
    try {
      const res = await getAllWeapons();
      setWeapons(res.data);
    } catch {
      alert("Failed to load weapons");
    }
  };

  const loadBullets = async () => {
    try {
      const res = await getAllBullets();
      setBullets(res.data);
    } catch {
      alert("Failed to load bullets");
    }
  };

  /* ================= SELECT WEAPON ================= */

  const selectWeapon = (weapon: Weapon) => {
    setSelectedWeapon(weapon);
    setWeaponType(weapon.weaponType);
    setSerialNumber(weapon.serialNumber);
    setRemarks(weapon.remarks || "");
    setStatus(weapon.status);
    setErrors({});
    setFormMessage("");
  };

  /* ================= SELECT BULLET ================= */

  const selectBullet = (bullet: Bullet) => {
    setSelectedBullet(bullet);
    setBulletType(bullet.bulletType);
    setNumberOfMagazines(bullet.numberOfMagazines.toString());
    setBulletRemarks(bullet.remarks || "");
    setErrors({});
    setFormMessage("");
  };

  /* ================= BULLET HANDLERS ================= */

  const handleAddBullet = async () => {
    const newErrors: Record<string, string> = {};
    if (!bulletType.trim()) newErrors.bulletType = "Bullet type is required";
    if (!numberOfMagazines.toString().trim() || isNaN(Number(numberOfMagazines)))
      newErrors.numberOfMagazines = "Number of magazines is required and must be a number";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormMessage("Please complete all required fields before saving.");
      return;
    }

    setErrors({});
    setFormMessage("");

    try {
      await addBullet({ 
        bulletType, 
        numberOfMagazines: Number(numberOfMagazines), 
        remarks: bulletRemarks 
      });
      alert("Bullets added successfully");
      
      setBulletType("");
      setNumberOfMagazines("");
      setBulletRemarks("");
      setBulletRegisterDate(new Date().toISOString().split("T")[0]);
      await loadBullets();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to add bullets");
    }
  };

  const handleUpdateBullet = async () => {
    if (!selectedBullet || !selectedBullet.bulletId) {
      alert("Please select bullets to update");
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!bulletType.trim()) newErrors.bulletType = "Bullet type is required";
    if (!numberOfMagazines.toString().trim() || isNaN(Number(numberOfMagazines)))
      newErrors.numberOfMagazines = "Number of magazines is required and must be a number";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormMessage("Please complete all required fields before updating.");
      return;
    }

    setErrors({});
    setFormMessage("");

    try {
      await updateBullet(selectedBullet.bulletId, {
        bulletType,
        numberOfMagazines: Number(numberOfMagazines),
        remarks: bulletRemarks
      });

      alert("Bullets updated successfully");
      setSelectedBullet(null);
      setBulletType("");
      setNumberOfMagazines("");
      setBulletRemarks("");
      await loadBullets();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to update bullets");
    }
  };

  /* ================= ADD WEAPON ================= */

  const handleAdd = async () => {
    const newErrors: Record<string, string> = {};

    if (!weaponType.trim())
      newErrors.weaponType = "Weapon type is required";
    if (!serialNumber.trim())
      newErrors.serialNumber = "Serial number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormMessage("Please complete all required fields before saving.");
      return;
    }

    setErrors({});
    setFormMessage("");

    try {
      await addWeapon({ weaponType, serialNumber, remarks });
      alert("Weapon added successfully");

      setWeaponType("");
      setSerialNumber("");
      setRemarks("");
      await loadWeapons();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to add weapon");
    }
  };

  /* ================= UPDATE WEAPON ================= */

  const handleUpdate = async () => {
    if (!selectedWeapon) {
      alert("Please select a weapon to update");
      return;
    }

    const newErrors: Record<string, string> = {};

    if (!weaponType.trim())
      newErrors.weaponType = "Weapon type is required";
    if (!status)
      newErrors.status = "Status is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setFormMessage("Please complete all required fields before updating.");
      return;
    }

    setErrors({});
    setFormMessage("");

    try {
      await updateWeapon(selectedWeapon.serialNumber, {
        weaponType,
        status,
        remarks,
      });

      alert("Weapon updated successfully");
      setSelectedWeapon(null);
      await loadWeapons();
    } catch {
      alert("Failed to update weapon");
    }
  };

  /* ================= BACK CONFIRM ================= */

  const handleBack = () => {
    if (weaponType || serialNumber || remarks || bulletType || numberOfMagazines || bulletRemarks) {
      const confirmBack = window.confirm(
        "You have unsaved changes. Are you sure you want to go back?"
      );
      if (!confirmBack) return;
    }
    onBack();
  };

  /* ================= UI ================= */

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen p-6 text-white">
      {/* BACK BUTTON */}
      <div className="mb-4">
        <button
          onClick={() => {
            handleBack();
            navigate('/oic/weapon-handover');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* WEAPON MANAGEMENT SECTION */}
      <div className="bg-slate-800/80 rounded-2xl p-8 mb-8 border border-slate-700/50">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Weapon Management</h2>
          <p className="text-slate-400 text-sm">Add new weapons or update existing records</p>
        </div>

        {/* MODE SWITCH BUTTONS */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => {
              setWeaponMode("add");
              setSelectedWeapon(null);
              setFormMessage("");
              setErrors({});
            }}
            className={`flex items-center gap-2 px-7 py-2.5 rounded-full font-semibold transition ${
              weaponMode === "add"
                ? "bg-[#0b0f16] text-blue-400 ring-1 ring-blue-700/30"
                : "bg-[#1c2333] text-white border border-blue-600/40 hover:border-blue-500"
            }`}
          >
            <PlusCircle size={18} />
            Register Weapon
          </button>

          <button
            onClick={() => {
              setWeaponMode("update");
              setFormMessage("");
              setErrors({});
            }}
            className={`flex items-center gap-2 px-7 py-2.5 rounded-full font-semibold transition ${
              weaponMode === "update"
                ? "bg-[#0b0f16] text-blue-400 ring-1 ring-blue-700/30"
                : "bg-[#1c2333] text-white border border-blue-600/40 hover:border-blue-500"
            }`}
          >
            <RefreshCcw size={18} />
            Update Weapon
          </button>
        </div>

        {/* ADD WEAPON MODE */}
        {weaponMode === "add" && (
          <div className="bg-slate-700/40 rounded-xl p-6 border border-slate-600/30">
            {formMessage && (
              <p className="mb-4 text-red-400 font-medium text-sm">{formMessage}</p>
            )}

            <p className="text-white font-semibold mb-6">Add New Weapon</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Weapon Type"
                value={weaponType}
                onChange={setWeaponType}
                error={errors.weaponType}
              />

              <Input
                label="Serial Number"
                value={serialNumber}
                onChange={setSerialNumber}
                error={errors.serialNumber}
              />

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Register date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full bg-white text-slate-900 border border-slate-400 rounded-lg px-4 py-2.5 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    value={weaponRegisterDate}
                    onChange={(e) => setWeaponRegisterDate(e.target.value)}
                  />
                  <span className="absolute right-3 top-3 text-slate-900">📅</span>
                </div>
              </div>
            </div>
            <div className="flex justify-start mt-6">
              <button
                onClick={handleAdd}
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-8 py-2.5 rounded-lg transition shadow-lg shadow-blue-800/30 flex items-center gap-2"
              >
                Register Weapon
              </button>
            </div>
          </div>
        )}

        {/* UPDATE WEAPON MODE */}
        {weaponMode === "update" && (
          <div className="bg-slate-700/40 rounded-xl p-6 border border-slate-600/30">
            {formMessage && (
              <p className="mb-4 text-red-400 font-medium text-sm">{formMessage}</p>
            )}

            <div className="mb-6">
              <label className="text-sm font-medium text-slate-300 block mb-2">Select Weapon</label>
              <select
                className="w-full bg-white text-slate-900 border border-slate-400 rounded-lg px-4 py-2.5 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                onChange={(e) => {
                  const weapon = weapons.find(
                    (w) => w.serialNumber === e.target.value
                  );
                  if (weapon) selectWeapon(weapon);
                }}
              >
                <option value="">-- Select weapon --</option>
                {weapons.map((w) => (
                  <option key={w.serialNumber} value={w.serialNumber}>
                    {w.weaponType} ({w.serialNumber})
                  </option>
                ))}
              </select>
            </div>

            {selectedWeapon && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Input
                    label="Weapon Type"
                    value={weaponType}
                    onChange={setWeaponType}
                    error={errors.weaponType}
                  />

                  <Input
                    label="Serial Number"
                    value={serialNumber}
                    onChange={setSerialNumber}
                    disabled
                  />

                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Register date</label>
                    <input
                      type="date"
                      disabled
                      className="w-full bg-slate-600 text-slate-300 border border-slate-500 rounded-lg px-4 py-2.5 font-medium opacity-60 cursor-not-allowed"
                      value={weaponRegisterDate}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Input label="Remarks" value={remarks} onChange={setRemarks} />

                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-white text-slate-900 border border-slate-400 rounded-lg px-4 py-2.5 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="ISSUED">ISSUED</option>
                      <option value="DISABLED">DISABLED</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="LOST">LOST</option>
                    </select>
                    {errors.status && (
                      <p className="text-red-400 text-xs mt-1.5">{errors.status}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-start">
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-8 py-2.5 rounded-lg transition shadow-lg shadow-blue-800/30 flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Update Weapon
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* BULLETS MANAGEMENT SECTION */}
      <div className="bg-slate-800/80 rounded-2xl p-8 border border-slate-700/50">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Bullets Inventory Management</h2>
          <p className="text-slate-400 text-sm">Add new bullet inventory or update existing records</p>
        </div>

        {/* MODE SWITCH BUTTONS */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => {
              setBulletMode("add");
              setSelectedBullet(null);
              setBulletType("");
              setNumberOfMagazines("");
              setBulletRemarks("");
              setFormMessage("");
              setErrors({});
            }}
            className={`flex items-center gap-2 px-7 py-2.5 rounded-full font-semibold transition ${
                bulletMode === "add"
                  ? "bg-[#0b0f16] text-blue-400 ring-1 ring-blue-700/30"
                  : "bg-[#1c2333] text-white border border-blue-600/40 hover:border-blue-500"
              }`}
          >
            <PlusCircle size={18} />
            Add Bullets
          </button>

          <button
            onClick={() => {
              setBulletMode("update");
              setFormMessage("");
              setErrors({});
            }}
            className={`flex items-center gap-2 px-7 py-2.5 rounded-full font-semibold transition ${
              bulletMode === "update"
                ? "bg-[#0b0f16] text-blue-400 ring-1 ring-blue-700/30"
                : "bg-[#1c2333] text-white border border-blue-600/40 hover:border-blue-500"
            }`}
          >
            <RefreshCcw size={18} />
            Update Bullets
          </button>
        </div>

        {/* ADD BULLETS MODE */}
        {bulletMode === "add" && (
          <div className="bg-slate-700/40 rounded-xl p-6 border border-slate-600/30">
            {formMessage && (
              <p className="mb-4 text-red-400 font-medium text-sm">{formMessage}</p>
            )}

            <p className="text-white font-semibold mb-6">Add New Bullet Inventory</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Bullet Type"
                value={bulletType}
                onChange={setBulletType}
                error={errors.bulletType}
              />

              <Input
                label="Number of Magazines"
                value={numberOfMagazines}
                onChange={setNumberOfMagazines}
                error={errors.numberOfMagazines}
              />

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Register date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full bg-white text-slate-900 border border-slate-400 rounded-lg px-4 py-2.5 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    value={bulletRegisterDate}
                    onChange={(e) => setBulletRegisterDate(e.target.value)}
                  />
                  <span className="absolute right-3 top-3 text-slate-900">📅</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Input 
                label="Remarks" 
                value={bulletRemarks} 
                onChange={setBulletRemarks} 
              />
            </div>

            <div className="flex justify-start mt-6">
              <button
                onClick={handleAddBullet}
                className="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-8 py-2.5 rounded-lg transition shadow-lg shadow-blue-800/30 flex items-center gap-2"
              >
                Add Bullets
              </button>
            </div>
          </div>
        )}

        {/* UPDATE BULLETS MODE */}
        {bulletMode === "update" && (
          <div className="bg-slate-700/40 rounded-xl p-6 border border-slate-600/30">
            {formMessage && (
              <p className="mb-4 text-red-400 font-medium text-sm">{formMessage}</p>
            )}

            <div className="mb-6">
              <label className="text-sm font-medium text-slate-300 block mb-2">Select Bullets</label>
              <select
                className="w-full bg-white text-slate-900 border border-slate-400 rounded-lg px-4 py-2.5 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                onChange={(e) => {
                  const bullet = bullets.find((b) => b.bulletId === Number(e.target.value));
                  if (bullet) selectBullet(bullet);
                }}
              >
                <option value="">-- Select bullets --</option>
                {bullets.map((b) => (
                  <option key={b.bulletId} value={b.bulletId}>
                    {b.bulletType} ({b.numberOfMagazines} magazines)
                  </option>
                ))}
              </select>
            </div>

            {selectedBullet && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Input
                    label="Bullet Type"
                    value={bulletType}
                    onChange={setBulletType}
                    error={errors.bulletType}
                  />

                  <Input
                    label="Number of Magazines"
                    value={numberOfMagazines}
                    onChange={setNumberOfMagazines}
                    error={errors.numberOfMagazines}
                  />

                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-2">Register date</label>
                    <input
                      type="date"
                      disabled
                      className="w-full bg-slate-600 text-slate-300 border border-slate-500 rounded-lg px-4 py-2.5 font-medium opacity-60 cursor-not-allowed"
                      value={bulletRegisterDate}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <Input 
                    label="Remarks" 
                    value={bulletRemarks} 
                    onChange={setBulletRemarks} 
                  />
                </div>

                <div className="flex justify-start">
                  <button
                    onClick={handleUpdateBullet}
                    className="bg-blue-800 hover:bg-blue-900 text-white font-semibold px-8 py-2.5 rounded-lg transition shadow-lg shadow-blue-800/30 flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Update Bullets
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= INPUT ================= */

function Input({
  label,
  value,
  onChange,
  error,
  disabled = false,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  error?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-300 block mb-2">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white text-slate-900 border border-slate-400 rounded-lg px-4 py-2.5 font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-600 disabled:text-slate-400 disabled:border-slate-500 disabled:cursor-not-allowed transition"
      />
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}