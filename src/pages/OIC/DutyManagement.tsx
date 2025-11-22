import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import DutyPopupModel from "../../components/UI/DutyPopupModel";

import type { OfficerDutyRow, DutyCreatePayload } from "../../types/duty";
import * as dutyService from "../../api/dutyService";

function DutyManagement() {
  const events = [
    { title: "new", date: new Date() },
    { title: "new new", date: new Date("2025-11-20") },
  ];

  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [rows, setRows] = useState<OfficerDutyRow[]>([]);
  const [loading, setLoading] = useState(false);

  const locations = ["Colombo", "Kandy", "Galle", "Jaffna"];
  const times = ["08:00", "12:00", "16:00", "20:00"];

  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(info.dateStr);
    setOpen(true);
  };

  // Load rows when popup opens / selectedDate changes
    useEffect(() => {
      if (!open || !selectedDate) return;
  
      setLoading(true);
      (dutyService as any).getOfficerRowsByDate(selectedDate)
        .then(setRows)
        .finally(() => setLoading(false));
    }, [open, selectedDate]);

  const updateRow = (
    index: number,
    key: keyof OfficerDutyRow,
    value: any
  ) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const handleAddDuties = async () => {
    // Build payload for only rows that user filled (time + location)
    const payload: DutyCreatePayload[] = rows
      .filter((r) => r.location && r.datetime)  // must have both to save
      .map((r) => ({
        assignedOfficer: r.officerId,
        datetime: r.datetime!, // already full datetime
        duration: r.duration ?? 240,  // default if empty
        taskType: r.taskType ?? "General",
        status: r.status || "OPEN",
        location: r.location,
        description: r.description || "",
      }));

    if (payload.length === 0) {
      alert("Please select Location and Time for at least one officer.");
      return;
    }

    setLoading(true);
    try {
      await (dutyService as any).bulkSaveDuties(payload);
      // reload updated duties
      const updated = await (dutyService as any).getOfficerRowsByDate(selectedDate);
      setRows(updated);
      alert("Duties saved!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 p-5 overflow-y-auto">
        <FullCalendar
          height="auto"
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dayCellClassNames={"text-md font-semibold"}
          weekends={true}
          events={events}
          dateClick={handleDateClick}
        />
      </div>

      <DutyPopupModel open={open} onClose={() => setOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">
          {`Details for ${selectedDate}`}
        </h2>

        {loading && <p className="mb-3">Loading...</p>}

        <table className="w-full border mb-5">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Description</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={r.officerId}>
                {/* Name auto-load (no dropdown) */}
                <td className="p-2 border font-medium">{r.officerName}</td>

                {/* Location dropdown */}
                <td className="p-2 border">
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={r.location}
                    onChange={(e) =>
                      updateRow(i, "location", e.target.value)
                    }
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Time dropdown */}
                <td className="p-2 border">
                  <select
                    className="w-full border rounded px-2 py-1"
                    value={r.datetime ? r.datetime.substring(11, 16) : ""}
                    onChange={(e) =>
                      updateRow(
                        i,
                        "datetime",
                        `${selectedDate}T${e.target.value}:00`
                      )
                    }
                  >
                    <option value="">Select Time</option>
                    {times.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Status manual */}
                <td className="p-2 border">
                  <input
                    className="w-full border rounded px-2 py-1"
                    placeholder="Status"
                    value={r.status}
                    onChange={(e) =>
                      updateRow(i, "status", e.target.value)
                    }
                  />
                </td>

                {/* Description manual */}
                <td className="p-2 border">
                  <input
                    className="w-full border rounded px-2 py-1"
                    placeholder="Description"
                    value={r.description}
                    onChange={(e) =>
                      updateRow(i, "description", e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}

            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-3 text-center">
                  No Field Officers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div>
          <button
            onClick={handleAddDuties}
            disabled={loading}
            className="bg-[#f61010] text-lg font-semibold px-5 py-1.5 rounded-full hover:bg-[#fb3636] mr-3 disabled:opacity-60"
          >
            Add Duty
          </button>

          <button
            className="bg-[#f61010] text-lg font-semibold px-5 py-1.5 rounded-full hover:bg-[#fb3636] mr-3"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </div>
      </DutyPopupModel>
    </>
  );
}

export default DutyManagement;

