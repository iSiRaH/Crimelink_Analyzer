import { useEffect, useState } from "react";
import * as adminService from "../../api/adminService";
import type { SystemHealthResponse } from "../../api/adminService";
import { FaSync, FaServer, FaDatabase, FaClock } from "react-icons/fa";

/* ───────────── tiny helpers ───────────── */
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-primary" />
    <span className="ml-4 text-gray-400 text-lg">Checking system health…</span>
  </div>
);

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok: boolean;
  isTime?: boolean;
}
const StatusCard = ({ icon, label, value, ok, isTime }: StatusCardProps) => (
  <div className="bg-dark-panel rounded-2xl border border-dark-border p-6 transition-all hover:border-dark-border-light">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isTime
              ? "bg-blue-500/15 text-blue-400"
              : ok
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {icon}
        </div>
        <span className="text-gray-400 text-sm font-medium">{label}</span>
      </div>
      {!isTime && (
        <span className="relative flex h-3 w-3">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              ok ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-3 w-3 ${
              ok ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
        </span>
      )}
    </div>
    <p
      className={`text-2xl lg:text-3xl font-bold ${
        isTime ? "text-white" : ok ? "text-emerald-400" : "text-red-400"
      }`}
    >
      {value}
    </p>
  </div>
);

/* ═══════════════ main component ═══════════════ */
function SystemHealth() {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getSystemHealth();
      setHealth(data);
      setLastChecked(new Date());
    } catch (err) {
      console.error("Failed to check system health:", err);
      setHealth({
        status: "DOWN",
        database: "Disconnected",
        timestamp: new Date().toISOString(),
      });
      setLastChecked(new Date());
      setError("Failed to reach the server. Displaying last known status.");
    } finally {
      setLoading(false);
    }
  };

  const isUp = health?.status === "UP";
  const isDbOk = health?.database === "Connected";

  return (
    <div className="w-full min-h-screen bg-dark-bg text-white font-[Inter,system-ui,sans-serif] p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">System Health</h1>
          {lastChecked && (
            <p className="text-gray-500 text-xs mt-1">
              Auto-refreshes every 30s · Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-primary hover:bg-purple-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50"
          aria-label="Refresh system health"
        >
          <FaSync size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 flex items-center mb-6">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Status cards */}
      {loading && !health ? (
        <Spinner />
      ) : health ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard
            icon={<FaServer size={18} />}
            label="System Status"
            value={health.status}
            ok={isUp}
          />
          <StatusCard
            icon={<FaDatabase size={18} />}
            label="Database"
            value={health.database}
            ok={isDbOk}
          />
          <StatusCard
            icon={<FaClock size={18} />}
            label="Last Checked"
            value={new Date(health.timestamp).toLocaleString()}
            ok={true}
            isTime
          />
        </div>
      ) : null}

      {/* Overall status banner */}
      {health && (
        <div
          className={`mt-8 rounded-2xl border p-5 flex items-center gap-4 ${
            isUp && isDbOk
              ? "bg-emerald-500/10 border-emerald-500/25"
              : "bg-red-500/10 border-red-500/25"
          }`}
        >
          <span className="relative flex h-4 w-4">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isUp && isDbOk ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-4 w-4 ${
                isUp && isDbOk ? "bg-emerald-500" : "bg-red-500"
              }`}
            />
          </span>
          <div>
            <p className={`font-semibold ${isUp && isDbOk ? "text-emerald-400" : "text-red-400"}`}>
              {isUp && isDbOk ? "All Systems Operational" : "System Issues Detected"}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {isUp && isDbOk
                ? "All services are running normally."
                : "One or more services are experiencing issues. Check the details above."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemHealth;
