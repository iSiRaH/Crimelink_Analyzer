import React from "react";

const IssueWeaponModal: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      {/* Modal */}
      <div className="w-[360px] rounded-xl bg-[#0f172a] text-gray-200 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold">
            Issue Weapon: Glock 17 (G17-998A)
          </h2>
          <button className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">

          {/* Officer Details */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400">
              Officer Details
            </h3>

            <select className="w-full rounded-md bg-[#020617] border border-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>Select Officer</option>
              <option>Officer 44552</option>
            </select>

            <div className="flex justify-between text-xs text-gray-400">
              <span>Badge: #4552</span>
              <span>Duty: Patrol B</span>
            </div>
          </section>

          {/* Weapon Details */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400">
              Weapon Details
            </h3>

            <div className="rounded-md bg-[#020617] border border-gray-700 p-3 text-sm">
              <div className="flex justify-between">
                <span>Glock 17</span>
                <span className="text-green-400">Available: 1</span>
              </div>
              <span className="text-xs text-gray-400">G17-998A</span>
            </div>
          </section>

          {/* Issue Information */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400">
              Issue Information
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                className="rounded-md bg-[#020617] border border-gray-700 px-3 py-2 text-xs"
              />
              <input
                type="time"
                className="rounded-md bg-[#020617] border border-gray-700 px-3 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Ammo Issued"
                className="rounded-md bg-[#020617] border border-gray-700 px-3 py-2 text-xs"
              />
              <input
                type="text"
                placeholder="Condition (Good)"
                className="rounded-md bg-[#020617] border border-gray-700 px-3 py-2 text-xs"
              />
            </div>

            <textarea
              placeholder="Notes"
              rows={3}
              className="w-full rounded-md bg-[#020617] border border-gray-700 px-3 py-2 text-xs"
            />
          </section>

          {/* Confirmation */}
          <div className="flex items-start gap-2 text-xs text-gray-400">
            <input type="checkbox" className="mt-1" />
            <p>
              I confirm, I assure receipt of this weapon and understand the
              responsibility.
            </p>
          </div>

          {/* Action */}
          <button className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold hover:bg-blue-700 transition">
            Issue Weapon
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueWeaponModal;
