import { useState } from "react";

function SystemSettings() {
  const [settings, setSettings] = useState({
    jwtExpiry: "24",
    passwordMinLength: "8",
    maxLoginAttempts: "5",
    sessionTimeout: "30",
    backupRetentionDays: "30",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
    // TODO: Implement save logic
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Security Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              JWT Token Expiry (hours)
            </label>
            <input
              type="number"
              name="jwtExpiry"
              value={settings.jwtExpiry}
              onChange={handleChange}
              className="w-full md:w-1/3 border rounded px-3 py-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              How long JWT tokens remain valid
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password Minimum Length
            </label>
            <input
              type="number"
              name="passwordMinLength"
              value={settings.passwordMinLength}
              onChange={handleChange}
              className="w-full md:w-1/3 border rounded px-3 py-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              Minimum characters required for passwords
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Max Login Attempts
            </label>
            <input
              type="number"
              name="maxLoginAttempts"
              value={settings.maxLoginAttempts}
              onChange={handleChange}
              className="w-full md:w-1/3 border rounded px-3 py-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              Number of failed attempts before lockout
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              name="sessionTimeout"
              value={settings.sessionTimeout}
              onChange={handleChange}
              className="w-full md:w-1/3 border rounded px-3 py-2"
            />
            <p className="text-sm text-gray-600 mt-1">
              Inactivity timeout for user sessions
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Backup Settings</h2>

        <div>
          <label className="block text-sm font-medium mb-2">
            Backup Retention (days)
          </label>
          <input
            type="number"
            name="backupRetentionDays"
            value={settings.backupRetentionDays}
            onChange={handleChange}
            className="w-full md:w-1/3 border rounded px-3 py-2"
          />
          <p className="text-sm text-gray-600 mt-1">
            How long to keep backup files before deletion
          </p>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Note:</h3>
        <p className="text-yellow-700">
          Changes to security settings will take effect after the next application
          restart. Ensure all administrators are notified before making critical
          changes.
        </p>
      </div>
    </div>
  );
}

export default SystemSettings;
