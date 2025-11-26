// src/pages/OIC/DutyManagement.tsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import { useEffect, useState } from "react";

import DutyPopupModel from "../../components/UI/DutyPopupModel";
import type { OfficerDutyRow, DutyCreatePayload } from "../../types/duty";
import * as dutyService from "../../api/dutyService";

function DutyManagement() {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [rows, setRows] = useState<OfficerDutyRow[]>([]);
  const [loading, setLoading] = useState(false);

  const locations = ["Colombo", "Kandy", "Galle", "Jaffna"];
  const times = ["06:00", "21:00"];
  const statuses = ["Active", "Absent", "Completed"];

  // when user clicks calendar date
  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(info.dateStr);
    setOpen(true);
  };

  // Load officers rows when popup opens for a date
  useEffect(() => {
    if (!open || !selectedDate) return;

    setLoading(true);
    dutyService
      .getOfficerRowsByDate(selectedDate)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [open, selectedDate]);

  // update any row field
  const updateRow = (index: number, key: keyof OfficerDutyRow, value: any) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  // save duties
  const handleAddDuties = async () => {
    // ✅ build payload matching backend DutyScheduleRequest
    const payload: DutyCreatePayload[] = rows
      .filter((r) => r.location && r.datetime) // only filled rows
      .map((r) => ({
        officerId: r.officerId, // ✅ FIX: backend expects officerId
        date: r.datetime!,
        duration: r.duration ?? 240,
        taskType: r.taskType ?? "General",
        status: r.status?.trim() || "Active",
        location: r.location!,
        description: r.description?.trim() || "",
        timeRange: r.datetime!.substring(11, 16),
      }));

    console.log("Saving payload ->", payload);

    if (payload.length === 0) {
      alert("Please select Location and Time for at least one officer.");
      return;
    }

    setLoading(true);
    try {
      await dutyService.saveDutiesBulk(payload);

      // reload updated duties after save
      const updated = await dutyService.getOfficerRowsByDate(selectedDate);
      setRows(updated);

      alert("Duties saved successfully!");
    } catch (err: any) {
      console.error("Save duties failed:", err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Unknown error";

      alert("Save failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Calendar */}
      <div className="flex-1 p-5 overflow-y-auto">
        <FullCalendar
          height="auto"
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dayCellClassNames={"text-md font-semibold"}
          weekends={true}
          dateClick={handleDateClick}
        />
      </div>

      {/* Popup */}
      <DutyPopupModel open={open} onClose={() => setOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">
          Details for {selectedDate}
        </h2>

        {loading && <p className="mb-3">Loading officers...</p>}

 <div className="max-h-96 overflow-y-auto block">
        <table className="w-full border mb-5 text-sm">
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
                <tr key={`${r.officerId}-${i}`}>
                  {/* Name auto-load */}
                  <td className="p-2 border font-medium">{r.officerName}</td>

                  {/* Location */}
                  <td className="p-2 border">
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={r.location}
                      onChange={(e) => updateRow(i, "location", e.target.value)}
                    >
                      <option value="">Select Location</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Time */}
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

                  {/* Status */}
                  <td className="p-2 border">
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={r.status || ""}
                      onChange={(e) => updateRow(i, "status", e.target.value)}
                    >
                      <option value="">Select Status</option>
                      {statuses.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Description */}
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
                    No active Field Officers found.
                  </td>
                </tr>
              )}
            </tbody>
        </table>
          </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddDuties}
            disabled={loading}
            className="bg-red-600 text-white text-lg font-semibold px-5 py-2 rounded-full hover:bg-red-500 disabled:opacity-60"
          >
            Add Duty
          </button>

          <button
            className="bg-gray-300 text-lg font-semibold px-5 py-2 rounded-full hover:bg-gray-400"
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
