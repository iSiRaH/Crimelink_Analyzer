import { useEffect, useState } from "react";
import * as adminService from "../../api/adminService";
import type { SystemHealthResponse } from "../../api/adminService";

function SystemHealth() {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const data = await adminService.getSystemHealth();
      setHealth(data);
    } catch (error) {
      console.error("Failed to check system health:", error);
      setHealth({
        status: "DOWN",
        database: "Disconnected",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Health</h1>
        <button
          onClick={checkHealth}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Checking..." : "Refresh"}
        </button>
      </div>

      {health && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-6 bg-white shadow">
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <div
              className={`text-3xl font-bold ${
                health.status === "UP" ? "text-green-600" : "text-red-600"
              }`}
            >
              {health.status}
            </div>
          </div>

          <div className="border rounded-lg p-6 bg-white shadow">
            <h3 className="text-lg font-semibold mb-2">Database</h3>
            <div
              className={`text-3xl font-bold ${
                health.database === "Connected"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {health.database}
            </div>
          </div>

          <div className="border rounded-lg p-6 bg-white shadow">
            <h3 className="text-lg font-semibold mb-2">Last Checked</h3>
            <div className="text-lg text-gray-700">
              {new Date(health.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemHealth;
