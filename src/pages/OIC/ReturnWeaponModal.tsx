import React, { useState } from "react";

interface Props {
  weapon: any;
  onClose: () => void;
}

const ReturnWeaponModal: React.FC<Props> = ({ weapon, onClose }) => {
  const now = new Date();
  const returnDate = now.toISOString().split("T")[0];
  const returnTime = now.toTimeString().slice(0, 5);

  const [condition, setCondition] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleReturn = () => {
    if (!condition || !confirmed) {
      alert("Please enter weapon condition and confirm return.");
      return;
    }

    console.log("Weapon Returned:", {
      weapon,
      returnDate,
      returnTime,
      condition,
    });

    alert("Weapon returned successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-[450px] max-h-[90vh] overflow-y-auto no-scrollbar rounded-xl bg-[#0f172a] text-gray-200 shadow-xl">

        {/* Header */}
        <div className="flex justify-between px-4 py-3 border-b border-gray-600">
          <h2 className="text-xl text-white font-semibold">Return Weapon</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">

          {/* Return Info */}
          <section className="border border-gray-700 bg-gray-800 rounded-md p-3">
            <h3 className="text-md text-center text-gray-200 mb-3">
              Return Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-400">Return Date</span>
                <input
                  value={returnDate}
                  readOnly
                  className="w-full bg-gray-900 border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
                />
              </div>
              <div>
                <span className="text-sm text-gray-400">Return Time</span>
                <input
                  value={returnTime}
                  readOnly
                  className="w-full bg-gray-900 border border-gray-700 px-3 py-2 text-xs rounded text-gray-400"
                />
              </div>
            </div>
          </section>

          {/* Weapon Info */}
          <section>
            <h3 className="text-md text-gray-400 mb-1">Weapon Details</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Weapon: {weapon?.type}</p>
              <p>Serial: {weapon?.serial}</p>
              <p
                className={`font-semibold ${
                  weapon?.status === "Issued"
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                Status: {weapon?.status}
              </p>
            </div>
          </section>

          {/* Officer Info */}
          <section>
            <h3 className="text-md text-gray-400 mb-1">Issued To</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Officer: {weapon?.assignedTo}</p>
              <p>Due Back: {weapon?.dueBack}</p>
            </div>
          </section>

          {/* Condition */}
          <section>
            <h3 className="text-md text-gray-400 mb-1">
              Weapon Condition <span className="text-red-400">*</span>
            </h3>
            <textarea
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Enter condition of the weapon upon return..."
              rows={3}
              className="w-full rounded-md bg-[#020617] border border-gray-700 px-3 py-2 text-xs"
            />
          </section>

          {/* Confirmation */}
          <div className="flex gap-2 text-xs text-gray-400 items-start">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <p>
              I confirm the weapon has been inspected and returned in proper
              condition.
            </p>
          </div>

          {/* Actions */}
          <div className="w-full flex gap-5 pt-2">
            <button
              onClick={onClose}
              className="w-1/2 border border-gray-600 py-2 rounded-md text-sm font-semibold hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              onClick={handleReturn}
              className="w-1/2 bg-blue-700 py-2 rounded-md text-sm font-semibold hover:bg-blue-500"
            >
              Confirm Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnWeaponModal;
