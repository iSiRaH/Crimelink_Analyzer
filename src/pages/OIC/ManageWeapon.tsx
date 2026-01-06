import { useEffect, useState } from "react";
import {
  addWeapon,
  updateWeapon,
  getAllWeapons,
} from "../../api/weaponApi";
import {
  ArrowLeft,
  PlusCircle,
  RefreshCcw,
  ChevronDown,
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

/* ================= COMPONENT ================= */

export default function ManageWeapon({ onBack }: Props) {
  const [mode, setMode] = useState<"add" | "update">("add");

  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);

  const [weaponType, setWeaponType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("AVAILABLE");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState("");

  /* ================= LOAD WEAPONS ================= */

  useEffect(() => {
    loadWeapons();
  }, []);

  const loadWeapons = async () => {
    try {
      const res = await getAllWeapons();
      setWeapons(res.data);
    } catch {
      alert("Failed to load weapons");
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
    if (weaponType || serialNumber || remarks) {
      const confirmBack = window.confirm(
        "You have unsaved changes. Are you sure you want to go back?"
      );
      if (!confirmBack) return;
    }
    onBack();
  };

  /* ================= UI ================= */

  return (
    <div className="bg-[#111827] rounded-xl p-6 mt-4 text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Weapon Management</h2>
          <p className="text-sm text-gray-400">
            Add new weapons or update existing records
          </p>
        </div>

        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* MODE SWITCH */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            setMode("add");
            setSelectedWeapon(null);
            setFormMessage("");
            setErrors({});
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            mode === "add"
              ? "bg-blue-600 border-blue-600"
              : "border-gray-600 text-gray-300"
          }`}
        >
          <PlusCircle size={16} />
          Add Weapon
        </button>

        <button
          onClick={() => {
            setMode("update");
            setFormMessage("");
            setErrors({});
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
            mode === "update"
              ? "bg-purple-600 border-purple-600"
              : "border-gray-600 text-gray-300"
          }`}
        >
          <RefreshCcw size={16} />
          Update Weapon
        </button>
      </div>

      {/* ADD MODE */}
      {mode === "add" && (
        <div className="bg-[#1f2937] rounded-xl p-5">
          {formMessage && (
            <p className="mb-3 text-red-400 font-medium">{formMessage}</p>
          )}

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

          <Input label="Remarks" value={remarks} onChange={setRemarks} />

          <ActionButton label="Save Weapon" color="blue" onClick={handleAdd} />
        </div>
      )}

      {/* UPDATE MODE */}
      {mode === "update" && (
        <div className="bg-[#1f2937] rounded-xl p-5 space-y-6">
          {formMessage && (
            <p className="text-red-400 font-medium">{formMessage}</p>
          )}

          <div>
            <label className="text-sm text-gray-400">Select Weapon</label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
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

              <Input label="Remarks" value={remarks} onChange={setRemarks} />

              <div>
                <label className="text-sm text-gray-400">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="ISSUED">ISSUED</option>
                  <option value="DISABLED">DISABLED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                  <option value="LOST">LOST</option>
                </select>
                {errors.status && (
                  <p className="text-red-400 text-xs mt-1">{errors.status}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-2 bg-purple-600 px-6 py-2 rounded hover:bg-purple-500"
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
    <div className="mt-3">
      <label className="text-sm text-gray-400">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent border border-gray-600 rounded px-3 py-2 disabled:opacity-50"
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* ================= BUTTON ================= */

function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: "blue" | "purple";
  onClick: () => void;
}) {
  return (
    <div className="flex justify-end mt-6">
      <button
        onClick={onClick}
        className={`px-6 py-2 rounded text-white ${
          color === "blue"
            ? "bg-blue-600 hover:bg-blue-500"
            : "bg-purple-600 hover:bg-purple-500"
        }`}
      >
        {label}
      </button>
    </div>
  );
}
