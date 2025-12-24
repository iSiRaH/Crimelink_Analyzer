import { useState } from "react";
import {
  ArrowLeft,
  PlusCircle,
  RefreshCcw,
  ChevronDown,
  CheckCircle,
} from "lucide-react";

type Props = {
  onBack: () => void;
};

type Weapon = {
  id: number;
  type: string;
  serial: string;
  registerDate: string;
};

export default function ManageWeapon({ onBack }: Props) {
  const [mode, setMode] = useState<"add" | "update">("add");

  const weapons: Weapon[] = [
    { id: 1, type: "AK 47", serial: "G-1359", registerDate: "2024-01-10" },
    { id: 2, type: "Minimi", serial: "T-4579", registerDate: "2024-02-05" },
    { id: 3, type: "Glock 17", serial: "K-6438", registerDate: "2023-12-20" },
  ];

  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);

  const [weaponType, setWeaponType] = useState("");
  const [serial, setSerial] = useState("");
  const [registerDate, setRegisterDate] = useState("");

  const selectWeapon = (weapon: Weapon) => {
    setSelectedWeapon(weapon);
    setWeaponType(weapon.type);
    setSerial(weapon.serial);
    setRegisterDate(weapon.registerDate);
  };

  return (
    <div className="bg-[#111827] rounded-xl p-6 mt-4 ">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Weapon Management</h2>
          <p className="text-sm text-gray-400">
            Add new weapons or update existing records
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-1 bg-gray-700 rounded hover:bg-gray-600"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* MODE SWITCH */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setMode("add")}
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
          onClick={() => setMode("update")}
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

      {/* ================= ADD MODE ================= */}
      {mode === "add" && (
        <div className="bg-[#1f2937] rounded-xl p-5">
          <h3 className="text-lg font-medium mb-4">Add New Weapon</h3>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Weapon Type" value={weaponType} onChange={setWeaponType} />
            <Input label="Serial Number" value={serial} onChange={setSerial} />
            <Input
              label="Register Date"
              type="date"
              value={registerDate}
              onChange={setRegisterDate}
            />
          </div>

          <ActionButton label="Save Weapon" color="blue" />
        </div>
      )}

      {/* ================= UPDATE MODE ================= */}
      {mode === "update" && (
        <div className="bg-[#1f2937] rounded-xl p-5 space-y-6">
          {/* STEP 1 */}
          <div>
            <h3 className="text-lg font-medium mb-2">
               Select Weapon
            </h3>

            <div className="relative">
              <select
                className="w-full bg-transparent border border-gray-600 rounded px-3 py-2 appearance-none"
                onChange={(e) => {
                  const weapon = weapons.find(
                    (w) => w.id === Number(e.target.value)
                  );
                  if (weapon) selectWeapon(weapon);
                }}
              >
                <option value="">-- Select weapon --</option>
                {weapons.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.type} ({w.serial})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* STEP 2 */}
          {selectedWeapon && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-2">
                   Update Information
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <Input label="Weapon Type" value={weaponType} onChange={setWeaponType} />
                  <Input label="Serial Number" value={serial} onChange={setSerial} />
                  <Input
                    label="Register Date"
                    type="date"
                    value={registerDate}
                    onChange={setRegisterDate}
                  />
                </div>
              </div>

              {/* ACTION */}
              <div className="flex justify-end">
                <button className="flex items-center gap-2 bg-purple-600 px-6 py-2 rounded hover:bg-purple-500">
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

/* ================= REUSABLE INPUT ================= */
function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-transparent border border-gray-600 rounded px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}

/* ================= ACTION BUTTON ================= */
function ActionButton({
  label,
  color,
}: {
  label: string;
  color: "blue" | "purple";
}) {
  return (
    <div className="flex justify-end mt-6">
      <button
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
