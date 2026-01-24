import { useEffect, useState } from "react";
import DutyPopupModel from "../../components/UI/DutyPopupModel";
import * as leaveService from "../../api/leaveService";
import type { LeaveRequest, LeaveStatus } from "../../types/leave";

type LeaveFilters = "All" | "Pending" | "Approved" | "Denied";

function LeaveManagement() {
  const [open, setOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<LeaveFilters>("Pending");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [responseReason, setResponseReason] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set current month as default
    const today = new Date();
    const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(monthStr);
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;
    loadLeaveRequests();
  }, [selectedMonth]);

  useEffect(() => {
    filterRequests();
  }, [leaveRequests, filter]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const data = await leaveService.getAllLeaveRequests(selectedMonth);
      setLeaveRequests(data);
    } catch (e) {
      console.error("Failed to load leave requests:", e);
      alert("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (filter === "All") {
      setFilteredRequests(leaveRequests);
    } else {
      setFilteredRequests(
        leaveRequests.filter((req) => req.status === filter)
      );
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      setProcessing(leaveId);
      await leaveService.updateLeaveStatus(leaveId, {
        status: "Approved",
        responseReason: responseReason[leaveId]?.trim() || undefined,
      });
      
      alert("Leave approved successfully");
      loadLeaveRequests();
      setResponseReason((prev) => {
        const updated = { ...prev };
        delete updated[leaveId];
        return updated;
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to approve leave";
      alert(msg);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async (leaveId: string) => {
    const reason = responseReason[leaveId]?.trim();
    if (!reason) {
      alert("Please provide a reason for denial");
      return;
    }

    try {
      setProcessing(leaveId);
      await leaveService.updateLeaveStatus(leaveId, {
        status: "Denied",
        responseReason: reason,
      });
      
      alert("Leave denied");
      loadLeaveRequests();
      setResponseReason((prev) => {
        const updated = { ...prev };
        delete updated[leaveId];
        return updated;
      });
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to deny leave";
      alert(msg);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadgeClass = (status: LeaveStatus) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-500 text-white";
      case "Denied":
        return "bg-red-500 text-white";
      case "Pending":
        return "bg-amber-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    
    // Current month and next 5 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      options.push({ value, label });
    }
    
    return options;
  };

  const getPendingCount = () =>
    leaveRequests.filter((req) => req.status === "Pending").length;

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Leave Management</h1>
        <p className="text-gray-600">Review and manage leave requests</p>
      </div>

      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            {/* Month Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Month
              </label>
              <select
                className="border rounded px-3 py-2 min-w-[200px]"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {getMonthOptions().map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Leaves Button */}
            <div className="flex items-end">
              <button
                onClick={() => setOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Leave Requests
                {getPendingCount() > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {getPendingCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Modal */}
      <DutyPopupModel open={open} onClose={() => setOpen(false)}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">
            Leave Requests - {selectedMonth && new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          {(["All", "Pending", "Approved", "Denied"] as LeaveFilters[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === f
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {f}
              {f === "Pending" && getPendingCount() > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {getPendingCount()}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-8">
            <p>Loading leave requests...</p>
          </div>
        )}

        {!loading && filteredRequests.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-lg">
            <p className="text-gray-600">No {filter.toLowerCase()} leave requests found</p>
          </div>
        )}

        {/* Leave Requests Table */}
        {!loading && filteredRequests.length > 0 && (
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 border text-left">Officer Name</th>
                  <th className="p-3 border text-left">Date</th>
                  <th className="p-3 border text-left">Reason</th>
                  <th className="p-3 border text-left">Status</th>
                  <th className="p-3 border text-left">Requested On</th>
                  <th className="p-3 border text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests
                  .sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime())
                  .map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="p-3 border font-medium">{req.officerName}</td>
                      <td className="p-3 border">{formatDate(req.date)}</td>
                      <td className="p-3 border max-w-xs">
                        <div className="line-clamp-2">{req.reason}</div>
                      </td>
                      <td className="p-3 border">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 border text-gray-600">
                        {formatDate(req.requestedDate)}
                      </td>
                      <td className="p-3 border">
                        {req.status === "Pending" ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Response reason (optional for approve, required for deny)"
                              className="w-full border rounded px-2 py-1 text-xs"
                              value={responseReason[req.id] || ""}
                              onChange={(e) =>
                                setResponseReason((prev) => ({
                                  ...prev,
                                  [req.id]: e.target.value,
                                }))
                              }
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(req.id)}
                                disabled={processing === req.id}
                                className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-emerald-700 disabled:bg-gray-400"
                              >
                                {processing === req.id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleDeny(req.id)}
                                disabled={processing === req.id}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 disabled:bg-gray-400"
                              >
                                {processing === req.id ? "..." : "Deny"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600">
                            {req.responseReason && (
                              <div>
                                <span className="font-medium">Response:</span> {req.responseReason}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setOpen(false)}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </DutyPopupModel>
    </div>
  );
}

export default LeaveManagement;