import { useAuth } from "../contexts/useAuth";

function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Administrator Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded hover:shadow-lg cursor-pointer">
              <h3 className="font-semibold">User Management</h3>
              <p className="text-gray-600 text-sm">Manage system users</p>
            </div>
            <div className="p-4 border rounded hover:shadow-lg cursor-pointer">
              <h3 className="font-semibold">System Settings</h3>
              <p className="text-gray-600 text-sm">Configure system</p>
            </div>
            <div className="p-4 border rounded hover:shadow-lg cursor-pointer">
              <h3 className="font-semibold">Reports</h3>
              <p className="text-gray-600 text-sm">View analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
