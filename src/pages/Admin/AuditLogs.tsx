import { useEffect, useState } from "react";
import * as adminService from "../../api/adminService";
import type { AuditLog } from "../../api/adminService";

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs(100, 0);
      setLogs(data);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      alert("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <button
          onClick={loadLogs}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading audit logs...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">ID</th>
                <th className="border p-2">User</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Action</th>
                <th className="border p-2">IP Address</th>
                <th className="border p-2">Login Time</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id || `audit-${index}`}>
                    <td className="border p-2">{log.id}</td>
                    <td className="border p-2">{log.userName || "Unknown"}</td>
                    <td className="border p-2 text-sm">{log.email || "N/A"}</td>
                    <td className="border p-2">{log.action}</td>
                    <td className="border p-2 text-sm font-mono">
                      {log.ipAddress === "0:0:0:0:0:0:0:1" ? "localhost" : log.ipAddress || "N/A"}
                    </td>
                    <td className="border p-2 text-sm">
                      {log.loginTime ? new Date(log.loginTime).toLocaleString() : "N/A"}
                    </td>
                    <td className="border p-2">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          log.success
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.success ? "Success" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
