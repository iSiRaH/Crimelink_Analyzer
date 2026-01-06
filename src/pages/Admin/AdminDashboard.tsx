import { useEffect, useState } from "react";
import * as adminService from "../../api/adminService";
import type { User } from "../../api/adminService";

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

function AdminDashboard() {
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: { Admin: 0, OIC: 0, Investigator: 0, FieldOfficer: 0 },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const users = await adminService.getAllUsers();
      calculateStats(users);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (users: User[]) => {
    const newStats: UserStats = {
      total: users.length,
      active: users.filter((u) => u.status === "Active").length,
      inactive: users.filter((u) => u.status === "Inactive").length,
      byRole: {
        Admin: users.filter((u) => u.role === "Admin").length,
        OIC: users.filter((u) => u.role === "OIC").length,
        Investigator: users.filter((u) => u.role === "Investigator").length,
        FieldOfficer: users.filter((u) => u.role === "FieldOfficer").length,
      },
    };
    setStats(newStats);
  };

  return (
    <div className="p-6 bg-slate-500">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {loading ? (
        <p>Loading statistics...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Total Users
              </h3>
              <div className="text-4xl font-bold text-blue-900">
                {stats.total}
              </div>
            </div>

            <div className="bg-green-100 border border-green-300 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Active Users
              </h3>
              <div className="text-4xl font-bold text-green-900">
                {stats.active}
              </div>
            </div>

            <div className="bg-red-100 border border-red-300 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Inactive Users
              </h3>
              <div className="text-4xl font-bold text-red-900">
                {stats.inactive}
              </div>
            </div>
          </div>

          {/* Users by Role */}
          <div className="bg-white border rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Users by Role</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-800">
                  {stats.byRole.Admin}
                </div>
                <div className="text-sm text-gray-600">Admin</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-800">
                  {stats.byRole.OIC}
                </div>
                <div className="text-sm text-gray-600">OIC</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-800">
                  {stats.byRole.Investigator}
                </div>
                <div className="text-sm text-gray-600">Investigator</div>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-800">
                  {stats.byRole.FieldOfficer}
                </div>
                <div className="text-sm text-gray-600">Field Officer</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white border rounded-lg p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/admin/user-management"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 text-center transition"
              >
                <div className="text-lg font-semibold text-blue-800">
                  Manage Users
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  Create, edit, or deactivate users
                </div>
              </a>

              <a
                href="/admin/audit-logs"
                className="block p-4 bg-green-50 hover:bg-green-100 rounded border border-green-200 text-center transition"
              >
                <div className="text-lg font-semibold text-green-800">
                  View Audit Logs
                </div>
                <div className="text-sm text-green-600 mt-1">
                  Monitor user activities
                </div>
              </a>

              <a
                href="/admin/backup-restore"
                className="block p-4 bg-orange-50 hover:bg-orange-100 rounded border border-orange-200 text-center transition"
              >
                <div className="text-lg font-semibold text-orange-800">
                  Backup Database
                </div>
                <div className="text-sm text-orange-600 mt-1">
                  Create or restore backups
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;