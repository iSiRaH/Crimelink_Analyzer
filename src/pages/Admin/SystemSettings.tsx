import { useState } from "react";
import {
  FaCog,
  FaSave,
  FaShieldAlt,
  FaDatabase,
  FaInfoCircle,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";

/* ───────────── tiny helpers ───────────── */
const Toast = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
  <div className="fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
    <FaCheckCircle />
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="text-current hover:opacity-70 transition-opacity" aria-label="Close">
      <FaTimes size={14} />
    </button>
  </div>
);

interface SettingInputProps {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
}
const SettingInput = ({ id, label, hint, value, onChange, name }: SettingInputProps) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-4 border-b border-dark-border last:border-0">
    <div className="sm:w-1/2">
      <label htmlFor={id} className="block text-sm font-medium text-white">
        {label}
      </label>
      <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
    </div>
    <div className="sm:w-1/2 sm:max-w-[200px]">
      <input
        id={id}
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2.5 rounded-lg border border-dark-border bg-dark-bg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50"
      />
    </div>
  </div>
);

/* ═══════════════ main component ═══════════════ */
function SystemSettings() {
  const [settings, setSettings] = useState({
    jwtExpiry: "24",
    passwordMinLength: "8",
    maxLoginAttempts: "5",
    sessionTimeout: "30",
    backupRetentionDays: "30",
  });
  const [toast, setToast] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: Implement save logic with API
    setToast("Settings saved successfully!");
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="w-full min-h-screen bg-dark-bg text-white font-[Inter,system-ui,sans-serif] p-6 lg:p-8">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-primary/15 flex items-center justify-center text-purple-primary">
            <FaCog size={18} />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold">System Settings</h1>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-purple-primary hover:bg-purple-hover text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <FaSave size={14} /> Save Settings
        </button>
      </div>

      {/* Security Settings */}
      <div className="bg-dark-panel rounded-2xl border border-dark-border p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FaShieldAlt className="text-blue-400" />
          <h2 className="text-lg font-semibold">Security Settings</h2>
        </div>
        <p className="text-gray-500 text-xs mb-4">Configure authentication and access control parameters.</p>

        <SettingInput
          id="ss-jwt"
          name="jwtExpiry"
          label="JWT Token Expiry (hours)"
          hint="How long JWT tokens remain valid"
          value={settings.jwtExpiry}
          onChange={handleChange}
        />
        <SettingInput
          id="ss-pwd"
          name="passwordMinLength"
          label="Password Minimum Length"
          hint="Minimum characters required for passwords"
          value={settings.passwordMinLength}
          onChange={handleChange}
        />
        <SettingInput
          id="ss-attempts"
          name="maxLoginAttempts"
          label="Max Login Attempts"
          hint="Number of failed attempts before lockout"
          value={settings.maxLoginAttempts}
          onChange={handleChange}
        />
        <SettingInput
          id="ss-timeout"
          name="sessionTimeout"
          label="Session Timeout (minutes)"
          hint="Inactivity timeout for user sessions"
          value={settings.sessionTimeout}
          onChange={handleChange}
        />
      </div>

      {/* Backup Settings */}
      <div className="bg-dark-panel rounded-2xl border border-dark-border p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FaDatabase className="text-amber-400" />
          <h2 className="text-lg font-semibold">Backup Settings</h2>
        </div>
        <p className="text-gray-500 text-xs mb-4">Configure automatic backup retention policies.</p>

        <SettingInput
          id="ss-retention"
          name="backupRetentionDays"
          label="Backup Retention (days)"
          hint="How long to keep backup files before deletion"
          value={settings.backupRetentionDays}
          onChange={handleChange}
        />
      </div>

      {/* Note */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <FaInfoCircle className="text-amber-400" />
          <h3 className="font-semibold text-amber-400 text-sm">Note</h3>
        </div>
        <p className="text-amber-300/80 text-sm leading-relaxed">
          Changes to security settings will take effect after the next application restart. Ensure all
          administrators are notified before making critical changes.
        </p>
      </div>
    </div>
  );
}

export default SystemSettings;
