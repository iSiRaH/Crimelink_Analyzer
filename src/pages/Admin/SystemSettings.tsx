import { useState, useEffect, useCallback } from "react";
import * as adminService from "../../api/adminService";
import type { SystemSettings as SettingsType } from "../../api/adminService";
import {
  FaCog,
  FaSave,
  FaShieldAlt,
  FaDatabase,
  FaInfoCircle,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSync,
} from "react-icons/fa";

/* ───────────── tiny helpers ───────────── */
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => (
  <div
    className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl ${
      type === "success"
        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
        : "bg-red-500/15 border border-red-500/30 text-red-400"
    }`}
  >
    {type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="text-current hover:opacity-70 transition-opacity" aria-label="Close">
      <FaTimes size={14} />
    </button>
  </div>
);

/* ───────────── validation rules (must match backend) ───────────── */
const VALIDATION: Record<string, { min: number; max: number; label: string }> = {
  jwtExpiry: { min: 1, max: 720, label: "JWT Token Expiry" },
  passwordMinLength: { min: 6, max: 128, label: "Password Minimum Length" },
  maxLoginAttempts: { min: 1, max: 20, label: "Max Login Attempts" },
  sessionTimeout: { min: 5, max: 1440, label: "Session Timeout" },
  backupRetentionDays: { min: 1, max: 365, label: "Backup Retention" },
};

interface SettingInputProps {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  min: number;
  max: number;
  error?: string;
}
const SettingInput = ({ id, label, hint, value, onChange, name, min, max, error }: SettingInputProps) => (
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
        min={min}
        max={max}
        className={`w-full p-2.5 rounded-lg border bg-dark-bg text-white text-sm focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500/50 focus:ring-red-500/50"
            : "border-dark-border focus:ring-purple-primary/50"
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  </div>
);

/* ═══════════════ main component ═══════════════ */
function SystemSettings() {
  const [settings, setSettings] = useState<SettingsType>({
    jwtExpiry: "24",
    passwordMinLength: "8",
    maxLoginAttempts: "5",
    sessionTimeout: "30",
    backupRetentionDays: "30",
  });
  const [savedSettings, setSavedSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /** Fetch settings from backend */
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getSettings();
      setSettings(data);
      setSavedSettings(data);
    } catch (error) {
      console.error("Failed to load settings:", error);
      showToast("Failed to load settings from server.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /** Client-side validation */
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const [key, rule] of Object.entries(VALIDATION)) {
      const raw = settings[key];
      const num = Number(raw);

      if (raw === "" || isNaN(num)) {
        newErrors[key] = `${rule.label} must be a valid number`;
      } else if (!Number.isInteger(num)) {
        newErrors[key] = `${rule.label} must be a whole number`;
      } else if (num < rule.min || num > rule.max) {
        newErrors[key] = `Must be between ${rule.min} and ${rule.max}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      showToast("Please fix validation errors before saving.", "error");
      return;
    }

    setSaving(true);
    try {
      const result = await adminService.saveSettings(settings);
      setSavedSettings(result.settings);
      setSettings(result.settings);
      showToast("Settings saved successfully!", "success");
    } catch (error: unknown) {
      console.error("Save failed:", error);
      const msg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to save settings"
          : "Failed to save settings. Check console for details.";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  /** Check if settings have been modified */
  const hasChanges =
    savedSettings !== null &&
    Object.keys(settings).some((key) => settings[key] !== savedSettings[key]);

  return (
    <div className="w-full min-h-screen bg-dark-bg text-white font-[Inter,system-ui,sans-serif] p-6 lg:p-8">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-primary/15 flex items-center justify-center text-purple-primary">
            <FaCog size={18} />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold">System Settings</h1>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs text-amber-400 font-medium">Unsaved changes</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || loading || !hasChanges}
            className="flex items-center gap-2 bg-purple-primary hover:bg-purple-hover text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <FaSync size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <FaSave size={14} /> Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <FaSync className="animate-spin mr-3" size={18} />
          <span>Loading settings…</span>
        </div>
      ) : (
        <>
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
              hint="How long JWT tokens remain valid (1–720)"
              value={settings.jwtExpiry}
              onChange={handleChange}
              min={1}
              max={720}
              error={errors.jwtExpiry}
            />
            <SettingInput
              id="ss-pwd"
              name="passwordMinLength"
              label="Password Minimum Length"
              hint="Minimum characters required for passwords (6–128)"
              value={settings.passwordMinLength}
              onChange={handleChange}
              min={6}
              max={128}
              error={errors.passwordMinLength}
            />
            <SettingInput
              id="ss-attempts"
              name="maxLoginAttempts"
              label="Max Login Attempts"
              hint="Number of failed attempts before lockout (1–20)"
              value={settings.maxLoginAttempts}
              onChange={handleChange}
              min={1}
              max={20}
              error={errors.maxLoginAttempts}
            />
            <SettingInput
              id="ss-timeout"
              name="sessionTimeout"
              label="Session Timeout (minutes)"
              hint="Inactivity timeout for user sessions (5–1440)"
              value={settings.sessionTimeout}
              onChange={handleChange}
              min={5}
              max={1440}
              error={errors.sessionTimeout}
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
              hint="How long to keep backup files before deletion (1–365)"
              value={settings.backupRetentionDays}
              onChange={handleChange}
              min={1}
              max={365}
              error={errors.backupRetentionDays}
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
        </>
      )}
    </div>
  );
}

export default SystemSettings;
