import { useEffect, useState } from "react";
import * as adminService from "../../api/adminService";
import type { AuditLog } from "../../api/adminService";
import { FaSync, FaSearch, FaClipboardList } from "react-icons/fa";

/* ───────────── tiny helpers ───────────── */
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-primary" />
    <span className="ml-4 text-gray-400 text-lg">Loading audit logs…</span>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <FaClipboardList className="mx-auto text-gray-600 text-4xl mb-4" />
    <p className="text-gray-400 text-lg font-medium">No audit logs found</p>
    <p className="text-gray-500 text-sm mt-1">There are no audit records matching your criteria.</p>
  </div>
);

/* ═══════════════ main component ═══════════════ */
function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAuditLogs(100, 0);
      setLogs(data);
    } catch {
      setError("Failed to load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── filtering ─── */
  const filtered = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      (log.userName || "").toLowerCase().includes(q) ||
      (log.email || "").toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Success" && log.success) ||
      (statusFilter === "Failed" && !log.success);

    return matchesSearch && matchesStatus;
  });

  const selectCls =
    "h-11 px-4 rounded-xl border border-dark-border bg-dark-bg text-white text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-primary/50 transition-colors";

  return (
    <div className="w-full min-h-screen bg-dark-bg text-white font-[Inter,system-ui,sans-serif] p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Audit Logs</h1>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-primary hover:bg-purple-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          aria-label="Refresh audit logs"
        >
          <FaSync size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 flex items-center justify-between mb-6">
          <span className="text-red-400 text-sm">{error}</span>
          <button
            onClick={loadLogs}
            className="ml-4 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-dark-panel rounded-2xl border border-dark-border p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-[220px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by user, email, or action…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 rounded-xl border border-dark-border bg-dark-bg text-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50 placeholder-gray-500"
              aria-label="Search audit logs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectCls}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-dark-border">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="bg-slate-700 text-white border-b-2 border-dark-border">
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">ID</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">User</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">Email</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">Action</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">IP Address</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">Login Time</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">Status</th>
              </tr>
            </thead>
            <tbody className="bg-dark-panel">
              {filtered.map((log, index) => (
                <tr
                  key={log.id || `audit-${index}`}
                  className="border-b border-dark-border hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400">{log.id}</td>
                  <td className="px-4 py-3 font-medium">{log.userName || "Unknown"}</td>
                  <td className="px-4 py-3 text-gray-300">{log.email || "N/A"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/15 text-blue-400">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {log.ipAddress === "0:0:0:0:0:0:0:1" ? "localhost" : log.ipAddress || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {log.loginTime ? new Date(log.loginTime).toLocaleString() : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        log.success
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {log.success ? "Success" : "Failed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
