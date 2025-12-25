import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import { useEffect, useState } from "react";

import DutyPopupModel from "../../components/UI/DutyPopupModel";
import type { OfficerDutyRow, DutyCreatePayload, DutyStatus } from "../../types/duty";
import * as dutyService from "../../api/dutyService";
import type { OfficerRecommendation } from "../../types/duty";

function DutyManagement() {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [rows, setRows] = useState<OfficerDutyRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);   
  const [saving, setSaving] = useState(false);             
  const [recommending, setRecommending] = useState(false); 

  const [recommendations, setRecommendations] = useState<OfficerRecommendation[]>([]);
  const [recommendOpen, setRecommendOpen] = useState(false);


  const locations = ["Matara", "Hakmana", "Weligama", "Akuressa"];
  const timeRanges = [
    { value: "06:00-21:00", label: "06:00 - 21:00", start: "06:00" },
    { value: "21:00-06:00", label: "21:00 - 06:00", start: "21:00" },
  ];
  const statusOptions: { value: DutyStatus; label: string }[] = [
    { value: "Active",    label: "Active" },
    { value: "Completed", label: "Completed" },
    { value: "Absent",    label: "Absent" },
  ];

  // AI recommend button
  const handleRecommend = async () => {
    if (!selectedDate) return;

    // simple example: use first row location
    const firstRow = rows[0];
    const location = firstRow?.location || "Matara";

    const req = {
      date: selectedDate,
      location,
      timeRange: undefined,
      requiredOfficers: 5,
    };

    try {
      setRecommending(true);
      const data = await dutyService.getRecommendations(req);
      setRecommendations(data);
      setRecommendOpen(true);
      
    } catch (e) {
      console.error("Recommendation error", e);
      alert("Failed to load recommendations");
    }
    finally {
      setRecommending(false);
    }
  };

  // when user clicks calendar date
  const handleDateClick = (info: DateClickArg) => {
    setSelectedDate(info.dateStr);
    setOpen(true);
    setRecommendations([]); // clear old recommendations when changing date
  };

  // Load officers rows when popup opens for a date
  useEffect(() => {
    if (!open || !selectedDate) return;

    setLoadingRows(true);
    dutyService
      .getOfficerRowsByDate(selectedDate)
      .then(setRows)
      .finally(() => setLoadingRows(false));
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
      .filter((r) => {
    // ignore rows with no status at all
      if (!r.status) return false;

    // allow ABSENT even if other fields are empty
      if (r.status === "Absent") return true;

    // for ACTIVE / COMPLETED → require location + timeRange
          return !!r.location && !!r.timeRange;
    })
      .map((r) => ({
        officerId: r.officerId,
        date: r.datetime || `${selectedDate}T00:00:00`, // or send selectedDate separately if backend uses LocalDate
        duration: r.duration ?? 240,
        taskType: r.taskType ?? "General",
        status: r.status ??"" as DutyStatus,
        location: r.status === "Absent" ? "" : r.location || "",
        description: r.description?.trim() || "",
        timeRange: r.timeRange || "",
      }));

    console.log("Saving payload ->", payload);

    if (payload.length === 0) {
      alert("Please select Location and Time for at least one officer.");
      return;
    }

    setSaving(true);
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
      setSaving(false);
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

        {loadingRows && <p className="mb-3">Loading officers...</p>}

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
                      value={r.location || ""}
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

                  {/* Time */}
                  <td className="p-2 border">
                    <select
                      className="w-full border rounded px-2 py-1"
                      value={r.timeRange || ""}
                      onChange={(e) => {
                        const selected = timeRanges.find(
                          (tr) => tr.value === e.target.value
                        );

                        if (!selected) return;

                        // save timeRange string (for DB time_range)
                        updateRow(i, "timeRange", selected.value);

                        // if you still need datetime, use the *start* time
                        updateRow(
                          i,
                          "datetime",
                          `${selectedDate}T${selected.start}:00`
                        );
                      }}
                    >
                      <option value="">Select Time Range</option>
                      {timeRanges.map((tr) => (
                        <option key={tr.value} value={tr.value}>
                          {tr.label}
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
                      {statusOptions.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Description */}
                  <td className="p-2 border">
                    <input
                      className="w-full border rounded px-2 py-1"
                      placeholder="Description"
                      value={r.description || ""}
                      onChange={(e) =>
                        updateRow(i, "description", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}

              {rows.length === 0 && !loadingRows && (
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
        <div className="mt-4 flex justify-between items-center">
        {/* Left side buttons */}
        <div className="flex gap-5">
        <button
            onClick={handleAddDuties}
            disabled={saving || loadingRows}
            className="bg-red-600 text-white text-lg font-semibold px-5 py-2 rounded-full"
        >
          {saving ? "Adding..." : "Add Duty"}
        </button>

        <button
            onClick={() => setOpen(false)}
            className="bg-gray-300 text-lg font-semibold px-5 py-2 rounded-full"
        >
          Cancel
        </button>
        </div>

        {/* Right side button */}
        <button
            onClick={handleRecommend}
            disabled={recommending}
            className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold"
        >
          {recommending ? "Recommending..." : "AI Recommend Officers"}
        </button>
        </div>

      </DutyPopupModel>
      

      {/* 🔹 Popup – AI Recommended Officers */}
      <DutyPopupModel open={recommendOpen} onClose={() => setRecommendOpen(false)}>
        <h2 className="text-xl font-semibold mb-4">
          AI Recommended Officers for {selectedDate}
        </h2>

        {recommending && <p className="mb-3 text-sm">Loading recommendations...</p>}

        {!recommending && recommendations.length === 0 && (
          <p className="text-sm text-gray-600">No recommendations found.</p>
        )}

        {recommendations.length > 0 && (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Score</th>
                  <th className="p-2 border">Reason</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((r) => (
                  <tr key={r.officerId}>
                    <td className="p-2 border font-medium">{r.name}</td>
                    <td className="p-2 border">{r.recommendationScore.toFixed(1)}</td>
                    <td className="p-2 border text-xs">{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            className="bg-gray-300 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-400"
            onClick={() => setRecommendOpen(false)}
          >
            Close
          </button>
        </div>
      </DutyPopupModel>

    </>
  );
}

export default DutyManagement;
