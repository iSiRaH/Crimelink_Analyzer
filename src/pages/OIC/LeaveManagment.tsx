import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as leaveService from "../../api/leaveService";
import type { LeaveRequest, LeaveStatus } from "../../types/leave";

function getCurrentMonthYYYYMM(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function safeTime(value?: string): number {
  if (!value) return 0;
  const t = Date.parse(value);
  return Number.isNaN(t) ? 0 : t;
}

export default function LeaveManagement() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [month, setMonth] = useState<string>(getCurrentMonthYYYYMM());

  const pendingCount = useMemo(
    () =>
      leaves.filter((l) => String(l.status).toUpperCase() === "PENDING").length,
    [leaves],
  );

  useEffect(() => {
    loadLeaves(month);
  }, [month]);

  const loadLeaves = async (m: string) => {
    try {
      setLoading(true);
      const data = await leaveService.getAllLeaveRequests(m);
      setLeaves(data);
    } catch (err) {
      console.error("Failed to load leave requests", err);
      alert("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const sortedLeaves = useMemo(() => {
    const copy = [...leaves];

    copy.sort((a, b) => {
      const aStatus = String(a.status).toUpperCase();
      const bStatus = String(b.status).toUpperCase();

      const aPending = aStatus === "PENDING";
      const bPending = bStatus === "PENDING";

      // 1) pending always first
      if (aPending !== bPending) return aPending ? -1 : 1;

      // 2) both pending -> newest requested first
      if (aPending && bPending) {
        return safeTime(b.requestedDate) - safeTime(a.requestedDate);
      }

      const byLeaveDate = safeTime(b.date) - safeTime(a.date);
      if (byLeaveDate !== 0) return byLeaveDate;

      return safeTime(b.requestedDate) - safeTime(a.requestedDate);
    });

    return copy;
  }, [leaves]);

  const NEW_MINUTES = 60;
  const isNew = (leave: LeaveRequest) => {
    if (String(leave.status).toUpperCase() !== "PENDING") return false;
    const diffMs = Date.now() - safeTime(leave.requestedDate);
    return diffMs >= 0 && diffMs <= NEW_MINUTES * 60 * 1000;
  };

  const handleAction = async (leaveId: number, status: LeaveStatus) => {
    let responseReason: string | undefined;

    if (status === "DENIED") {
      const reason = prompt("Enter reason for denial");
      if (!reason || !reason.trim()) return;
      responseReason = reason.trim();
    }

    try {
      setProcessingId(leaveId);

      const updated = await leaveService.updateLeaveStatus(leaveId, {
        status,
        responseReason,
      });

      setLeaves((prev) => prev.map((l) => (l.id === leaveId ? updated : l)));
    } catch (err) {
      console.error("Failed to update leave status", err);
      alert("Failed to update leave status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg p-3 text-white">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="group mb-2 flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium transition hover:bg-slate-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
      </div>

      <div className="mb-6 flex w-full flex-col justify-between gap-4 rounded-xl bg-dark-panel p-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold">Leave Management</h1>
          <p className="text-sm text-gray-300">
            Pending requests:{" "}
            <span className="font-semibold">{pendingCount}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="leave-month"
            className="text-sm font-medium text-gray-300"
          >
            Month
          </label>
          <input
            id="leave-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-dark-border bg-dark-bg px-3 py-2 text-sm text-gray-100 outline-none transition focus:border-slate-500"
          />
          <button
            onClick={() => loadLeaves(month)}
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="w-full rounded-xl bg-dark-panel p-6 sm:px-5">
          <p className="text-center text-gray-400">Loading leave requests...</p>
        </div>
      ) : (
        <div className="w-full rounded-xl bg-dark-panel p-6 sm:px-5">
          <div className="w-full overflow-auto rounded-xl border border-dark-border bg-dark-bg">
            <table className="min-w-[980px] w-full border-separate border-spacing-0 text-sm text-gray-200">
              <thead className="sticky top-0 z-10 bg-[#222a40]">
                <tr>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Officer
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Leave Date
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Reason
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Status
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Requested On
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Response Reason
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedLeaves.map((leave) => (
                  <tr
                    key={leave.id}
                    className={`transition-colors even:bg-white/[0.02] hover:bg-white/[0.06] ${isNew(leave) ? "bg-yellow-500/10" : ""}`}
                  >
                    <td className="border-b border-dark-border px-3 py-2.5 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <span>{leave.officerName}</span>

                        {isNew(leave) && (
                          <span className="px-2 py-[2px] rounded-full text-[10px] font-bold bg-yellow-500 text-white">
                            NEW
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="border-b border-dark-border px-3 py-2.5 text-gray-200">
                      {leave.date}
                    </td>
                    <td className="border-b border-dark-border px-3 py-2.5 text-gray-300">
                      {leave.reason}
                    </td>

                    <td className="border-b border-dark-border px-3 py-2.5">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          leave.status === "APPROVED"
                            ? "bg-green-500/20 text-green-300"
                            : leave.status === "DENIED"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    <td className="border-b border-dark-border px-3 py-2.5 text-gray-300">
                      {leave.requestedDate}
                    </td>
                    <td className="border-b border-dark-border px-3 py-2.5 text-gray-300">
                      {leave.responseReason || "-"}
                    </td>

                    <td className="border-b border-dark-border px-3 py-2.5">
                      {String(leave.status).toUpperCase() === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            disabled={processingId === leave.id}
                            onClick={() => handleAction(leave.id, "APPROVED")}
                            className="rounded bg-green-600 px-3 py-1 text-white transition hover:bg-green-500 disabled:opacity-50"
                          >
                            {processingId === leave.id ? "..." : "Approve"}
                          </button>

                          <button
                            disabled={processingId === leave.id}
                            onClick={() => handleAction(leave.id, "DENIED")}
                            className="rounded bg-red-600 px-3 py-1 text-white transition hover:bg-red-500 disabled:opacity-50"
                          >
                            {processingId === leave.id ? "..." : "Deny"}
                          </button>
                        </div>
                      ) : (
                        <span className="italic text-gray-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}

                {sortedLeaves.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-3 py-6 text-center text-gray-400"
                    >
                      No leave requests found for {month}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
