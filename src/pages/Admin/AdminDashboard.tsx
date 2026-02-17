import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as adminService from "../../api/adminService";
import type { User } from "../../api/adminService";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaUserCog,
  FaClipboardList,
  FaDatabase,
  FaShieldAlt,
  FaUserFriends,
  FaUserSecret,
  FaUserTie,
} from "react-icons/fa";

/* ───────────── types ───────────── */
interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: {
    Admin: number;
    OIC: number;
    Investigator: number;
    FieldOfficer: number;
  };
}

/* ───────────── tiny helpers ───────────── */
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-primary" />
    <span className="ml-4 text-gray-400 text-lg">Loading statistics…</span>
  </div>
);

const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 flex items-center justify-between mb-6">
    <span className="text-red-400 text-sm">{message}</span>
    <button
      onClick={onRetry}
      className="ml-4 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition-colors"
    >
      Retry
    </button>
  </div>
);

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
}
const KpiCard = ({ icon, label, value, gradient }: KpiCardProps) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-6 ${gradient} shadow-lg transition-transform hover:scale-[1.03]`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-white/70">{label}</p>
        <p className="text-4xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="text-white/30 text-4xl">{icon}</div>
    </div>
  </div>
);

interface RoleChipProps {
  icon: React.ReactNode;
  label: string;
  count: number;
}
const RoleChip = ({ icon, label, count }: RoleChipProps) => (
  <div className="flex items-center gap-3 bg-dark-bg rounded-xl px-5 py-4 border border-dark-border hover:border-purple-primary/40 transition-colors">
    <div className="text-purple-primary text-xl">{icon}</div>
    <div>
      <p className="text-2xl font-bold text-white">{count}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  </div>
);

interface QuickActionProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}
const QuickAction = ({ to, icon, title, desc }: QuickActionProps) => (
  <Link
    to={to}
    className="group flex items-start gap-4 p-5 bg-dark-bg rounded-xl border border-dark-border hover:border-purple-primary/50 transition-all hover:shadow-lg hover:shadow-purple-primary/5"
  >
    <div className="text-purple-primary text-2xl mt-0.5 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="text-white font-semibold group-hover:text-purple-primary transition-colors">
        {title}
      </p>
      <p className="text-gray-400 text-sm mt-1">{desc}</p>
    </div>
  </Link>
);

/* ═══════════════ main component ═══════════════ */
function AdminDashboard() {
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: { Admin: 0, OIC: 0, Investigator: 0, FieldOfficer: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const users = await adminService.getAllUsers();
      calculateStats(users);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      setError("Failed to load dashboard statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (users: User[]) => {
    setStats({
      total: users.length,
      active: users.filter((u) => u.status === "Active").length,
      inactive: users.filter((u) => u.status === "Inactive").length,
      byRole: {
        Admin: users.filter((u) => u.role === "Admin").length,
        OIC: users.filter((u) => u.role === "OIC").length,
        Investigator: users.filter((u) => u.role === "Investigator").length,
        FieldOfficer: users.filter((u) => u.role === "FieldOfficer").length,
      },
    });
  };

  return (
    <div className="w-full min-h-screen bg-dark-bg text-white font-[Inter,system-ui,sans-serif] p-6 lg:p-8">
      {/* Page header */}
      <h1 className="text-2xl lg:text-3xl font-bold mb-8">Admin Dashboard</h1>

      {error && <ErrorBanner message={error} onRetry={loadStats} />}

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <KpiCard
              icon={<FaUsers />}
              label="Total Users"
              value={stats.total}
              gradient="bg-gradient-to-br from-blue-600 to-blue-800"
            />
            <KpiCard
              icon={<FaUserCheck />}
              label="Active Users"
              value={stats.active}
              gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
            />
            <KpiCard
              icon={<FaUserTimes />}
              label="Inactive Users"
              value={stats.inactive}
              gradient="bg-gradient-to-br from-red-600 to-red-800"
            />
          </div>

          {/* ── Users by Role ── */}
          <div className="bg-dark-panel rounded-2xl border border-dark-border p-6 mb-8">
            <h2 className="text-lg font-semibold mb-5">Users by Role</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <RoleChip icon={<FaShieldAlt />} label="Admin" count={stats.byRole.Admin} />
              <RoleChip icon={<FaUserTie />} label="OIC" count={stats.byRole.OIC} />
              <RoleChip icon={<FaUserSecret />} label="Investigator" count={stats.byRole.Investigator} />
              <RoleChip icon={<FaUserFriends />} label="Field Officer" count={stats.byRole.FieldOfficer} />
            </div>
          </div>

          {/* ── Quick Actions ── */}
          <div className="bg-dark-panel rounded-2xl border border-dark-border p-6">
            <h2 className="text-lg font-semibold mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickAction
                to="/admin/user-management"
                icon={<FaUserCog />}
                title="Manage Users"
                desc="Create, edit, or deactivate users"
              />
              <QuickAction
                to="/admin/audit-logs"
                icon={<FaClipboardList />}
                title="View Audit Logs"
                desc="Monitor user activities"
              />
              <QuickAction
                to="/admin/backup-restore"
                icon={<FaDatabase />}
                title="Backup Database"
                desc="Create or restore backups"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;