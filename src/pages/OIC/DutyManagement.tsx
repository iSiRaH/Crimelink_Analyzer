import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateClickArg } from "@fullcalendar/interaction";
import { useEffect, useState } from "react";

import DutyPopupModel from "../../components/UI/DutyPopupModel";
import type {
  OfficerDutyRow,
  DutyCreatePayload,
  DutyStatus,
} from "../../types/duty";
import * as dutyService from "../../api/dutyService";
import type { OfficerRecommendation } from "../../types/duty";
import type { AxiosError } from "axios";

const DEFAULT_DUTY_LOCATIONS = ["Matara", "Hakmana", "Weligama", "Akuressa"];

function DutyManagement() {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // const [selectedDateKey, setSelectedDateKey] = useState("");//REMOVE
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(0);
  const [rows, setRows] = useState<OfficerDutyRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recommending, setRecommending] = useState(false);

  const [recommendations, setRecommendations] = useState<
    OfficerRecommendation[]
  >([]);
  const [recommendOpen, setRecommendOpen] = useState(false);

  const getDateKey = (date: Date): string => {
    // const y = date.getFullYear();
    // const m = String(date.getMonth() + 1).padStart(2, "0");
    // const d = String(date.getDate()).padStart(2, "0");
    // return `${y}-${m}-${d}`;   //REMOVE
    return date.toISOString().split("T")[0];
  };

  const [locations, setLocations] = useState<string[]>(DEFAULT_DUTY_LOCATIONS);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const timeRanges = [
    { value: "06:00-21:00", label: "06:00 - 21:00", start: "06:00" },
    { value: "21:00-06:00", label: "21:00 - 06:00", start: "21:00" },
  ];
  const statusOptions: { value: DutyStatus; label: string }[] = [
    { value: "Active", label: "Active" },
    { value: "Completed", label: "Completed" },
    { value: "Absent", label: "Absent" },
  ];

  const handleRecommend = async () => {
    if (!selectedDate) return;

    const firstRow = rows[0];
    const location = firstRow?.location || locations[0] || DEFAULT_DUTY_LOCATIONS[0];

    const req = {
      date: getDateKey(selectedDate),
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
    } finally {
      setRecommending(false);
    }
  };

  // const handleDateClick = (info: DateClickArg) => {
  //   setSelectedDate(info.dateStr);
  //   setOpen(true);
  //   setRecommendations([]); // clear old recommendations when changing date
  // };

  const handleDateClick = (arg: DateClickArg) => {
    const date = arg.date;
    setSelectedDate(date);
    // setSelectedDateKey(getDateKey(date)); //REMOVE
    setOpen(true);
  };


  useEffect(() => {
    let active = true;
    setLoadingLocations(true);

    dutyService
      .getDutyLocations()
      .then((data) => {
        if (!active) return;
        setLocations(data.length > 0 ? data : DEFAULT_DUTY_LOCATIONS);
      })
      .catch((err) => {
        console.error("Failed to load duty locations", err);
        if (active) {
          setLocations(DEFAULT_DUTY_LOCATIONS);
        }
      })
      .finally(() => {
        if (active) setLoadingLocations(false);
      });

    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!open || !selectedDate) return;

    setLoadingRows(true);

    const dateKey = getDateKey(selectedDate);
    console.log("Loading officers for:", dateKey); //REMOVE

    dutyService
      .getOfficerRowsByDate(dateKey)
      .then((data) => {
        console.log("Loaded officers:", data); //REMOVE
        setRows(data);
      })
      .catch((err) => {
        console.error("Failed to load officers", err);
        alert("Failed to load officers for the selected date.");
        setRows([]);
      })
      .finally(() => setLoadingRows(false));
  }, [open, selectedDate]);

  // update any row field
  const updateRow = <K extends keyof OfficerDutyRow>(
    index: number,
    key: K,
    value: OfficerDutyRow[K],
  ) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const handleAddDuties = async () => {
    if (!selectedDate) {
      alert("Please select a date.");
      return;
    }
    const dateKey = getDateKey(selectedDate);
    //  build payload matching backend DutyScheduleRequest
    const payload: DutyCreatePayload[] = rows
      .filter((r) => {
        // ignore rows with no status at all
        if (!r.status) return false;

        // allow ABSENT even if other fields are empty
        if (r.status === "Absent") return true;

        // for ACTIVE / COMPLETED → require location + timeRange
        return Boolean(r.location) && Boolean(r.timeRange);
      })
      .map((r) => {
        let finalDateTime = r.datetime;

        if (!finalDateTime) {
          const start = r.timeRange?.split("-")?.[0]?.trim() || "00:00";
          finalDateTime = `${dateKey}T${start}:00`;
        }
        return {
          officerId: r.officerId,
          date: finalDateTime,
          duration: r.duration ?? 240,
          taskType: r.taskType ?? "General",
          status: r.status ?? ("" as DutyStatus),
          location: r.status === "Absent" ? "" : r.location || "",
          description: (r.description ?? "").trim(),
          timeRange: r.status === "Absent" ? "" : (r.timeRange ?? ""),
        };
      });

    console.log("Saving payload ->", payload);

    if (payload.length === 0) {
      alert("Please select Location and Time for at least one officer.");
      return;
    }

    setSaving(true);
    try {
      await dutyService.saveDutiesBulk(payload);

      // reload updated duties after save
      const updated = await dutyService.getOfficerRowsByDate(dateKey);
      setRows(updated);
      alert("Duties saved successfully!");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      console.error("Save duties failed:", err);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Unknown error";
      alert("Save failed: " + msg);
    } finally {
      setSaving(false);
    }
  };

  /* lal---------------------------------------------*/

  // const [notes, setNotes] = useState<Record<string, string>>(() => {
  //   const savedNotes = localStorage.getItem("dutyNotes");
  //   if (savedNotes) {
  //     try {
  //       return JSON.parse(savedNotes);
  //     } catch {
  //       return {};
  //     }
  //   }
  //   return {};
  // });

  // useEffect(() => {
  //   localStorage.setItem("dutyNotes", JSON.stringify(notes));
  // }, [notes]);

  // const handleSaveNote = (note: string) => {
  //   if (note.trim()) {
  //     setNotes((prev) => ({
  //       ...prev,
  //       [selectedDateKey]: note,
  //     }));
  //   } else {
  //     setNotes((prev) => {
  //       const copy = { ...prev };
  //       delete copy[selectedDateKey];
  //       return copy;
  //     });
  //   }
  // };

  // const handleDeleteNote = () => {
  //   setNotes((prev) => {
  //     const copy = { ...prev };
  //     delete copy[selectedDateKey];
  //     return copy;
  //   });
  // };

  // const events = Object.entries(notes).map(([date, note]) => ({
  //   title: "•",
  //   date,
  //   allDay: true,
  //   extendedProps: { note },
  // }));
  /*lal-------------------------------------------------*/

  return (
    <div className="w-full h-screen bg-[#0b0c1a] text-white font-[Inter] flex items-center justify-center">
      {/* Calendar Container */}
      <div className="w-[1111px] h-[575px] rounded-[32px] bg-[#181d30] p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={new Date(currentYear, currentMonth, 1)}
          height="100%"
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "",
          }}
          dateClick={handleDateClick}
          // events={events}    //REMOVE
          // eventContent={() => (
          //   <div className="text-[#572aff] text-2xl text-center">•</div>
          // )}
          datesSet={(arg) => {
            setCurrentMonth(arg.start.getMonth());
            setCurrentYear(arg.start.getFullYear());
          }}
          dayCellClassNames={() =>
            "hover:bg-[rgba(87,42,255,0.15)] cursor-pointer transition-all"
          }
        />
      </div>

      {/* Popup */}
      <DutyPopupModel
        isOpen={open}
        date={selectedDate}
        onClose={() => setOpen(false)}
      >
        <h2 className="text-xl font-semibold mb-4">
          Details for {selectedDate?.toLocaleDateString()}
        </h2>

        {loadingRows && <p className="mb-3">Loading officers...</p>}

        <div className="max-h-96 overflow-y-auto block bg-slate-50">
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
                  <td className="p-2 border font-medium">{r.officerName}</td>

                  <td className="p-2 border">
                    <select
                      title="Select Location"
                      className="w-full border rounded px-2 py-1"
                      disabled={loadingLocations}
                      value={r.location || ""}
                      onChange={(e) => updateRow(i, "location", e.target.value)}
                    >
                      <option value="">
                        {loadingLocations ? "Loading locations..." : "Select Location"}
                      </option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2 border">
                    <select
                      title="Time Range"
                      className="w-full border rounded px-2 py-1"
                      value={r.timeRange || ""}
                      onChange={(e) => {
                        const selected = timeRanges.find(
                          (tr) => tr.value === e.target.value,
                        );
                        if (!selected) return;
                        updateRow(i, "timeRange", selected.value);
                        updateRow(
                          i,
                          "datetime",
                          `${getDateKey(selectedDate!)}T${selected.start}:00`,
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

                  <td className="p-2 border">
                    <select
                      title="Status"
                      className="w-full border rounded px-2 py-1"
                      value={r.status || ""}
                      onChange={(e) =>
                        updateRow(i, "status", e.target.value as DutyStatus)
                      }
                    >
                      <option value="">Select Status</option>
                      {statusOptions.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </td>

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

      {/*  Popup – AI Recommended Officers */}
      <DutyPopupModel
        isOpen={recommendOpen}
        date={selectedDate}
        onClose={() => setRecommendOpen(false)}
      >
        <h2 className="text-xl font-semibold mb-4">
          AI Recommended Officers for {selectedDate?.toLocaleDateString()}
        </h2>

        {recommending && (
          <p className="mb-3 text-sm">Loading recommendations...</p>
        )}

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
                    <td className="p-2 border">
                      {r.recommendationScore.toFixed(1)}
                    </td>
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
    </div>
  );
}

export default DutyManagement;
