import { useEffect, useMemo, useState } from "react";
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
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [month, setMonth] = useState<string>(getCurrentMonthYYYYMM());

  const pendingCount = useMemo(
    () => leaves.filter((l) => String(l.status).toUpperCase() === "PENDING").length,
    [leaves]
  );

  useEffect(() => {
    loadLeaves(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /**
   * ✅ SORT RULE:
   * 1) PENDING first (top)
   * 2) PENDING rows sorted by requestedDate DESC (newest request on top)
   * 3) APPROVED/DENIED rows sorted by LEAVE DATE (leave.date) DESC
   * 4) If same leave date -> requestedDate DESC
   */
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

      // 3) both NOT pending -> sort by leave date descending
      const byLeaveDate = safeTime(b.date) - safeTime(a.date);
      if (byLeaveDate !== 0) return byLeaveDate;

      // 4) tie-breaker: newest requestedDate first
      return safeTime(b.requestedDate) - safeTime(a.requestedDate);
    });

    return copy;
  }, [leaves]);

  // ✅ Optional: NEW badge for pending requests (within last 60 mins)
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

      // Update UI using backend response
      setLeaves((prev) => prev.map((l) => (l.id === leaveId ? updated : l)));
    } catch (err) {
      console.error("Failed to update leave status", err);
      alert("Failed to update leave status");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-sm text-slate-600">
            Pending requests: <span className="font-semibold">{pendingCount}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={() => loadLeaves(month)}
            className="bg-slate-800 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading leave requests...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full border text-sm">
            <thead className="bg-slate-200">
              <tr>
                <th className="p-2 border">Officer</th>
                <th className="p-2 border">Leave Date</th>
                <th className="p-2 border">Reason</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Requested On</th>
                <th className="p-2 border">Response Reason</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>

            <tbody>
              {sortedLeaves.map((leave) => (
                <tr
                  key={leave.id}
                  className={`text-center ${isNew(leave) ? "bg-yellow-50" : ""}`}
                >
                  <td className="p-2 border font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <span>{leave.officerName}</span>

                      {isNew(leave) && (
                        <span className="px-2 py-[2px] rounded-full text-[10px] font-bold bg-yellow-500 text-white">
                          NEW
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-2 border">{leave.date}</td>
                  <td className="p-2 border">{leave.reason}</td>

                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        leave.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : leave.status === "DENIED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>

                  <td className="p-2 border">{leave.requestedDate}</td>
                  <td className="p-2 border">{leave.responseReason || "-"}</td>

                  <td className="p-2 border">
                    {String(leave.status).toUpperCase() === "PENDING" ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          disabled={processingId === leave.id}
                          onClick={() => handleAction(leave.id, "APPROVED")}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {processingId === leave.id ? "..." : "Approve"}
                        </button>

                        <button
                          disabled={processingId === leave.id}
                          onClick={() => handleAction(leave.id, "DENIED")}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {processingId === leave.id ? "..." : "Deny"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">Completed</span>
                    )}
                  </td>
                </tr>
              ))}

              {sortedLeaves.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No leave requests found for {month}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
