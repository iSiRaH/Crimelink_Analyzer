import { useState, useEffect } from "react";
import * as adminService from "../../api/adminService";
import type { BackupInfo } from "../../api/adminService";
import {
  FaDatabase,
  FaUpload,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
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

/** Format bytes into human-readable size */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/* ═══════════════ main component ═══════════════ */
function BackupRestore() {
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState("");
  const [manualFilename, setManualFilename] = useState("");
  const [useManual, setUseManual] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    action: () => void;
    danger?: boolean;
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /** Fetch available backups */
  const fetchBackups = async () => {
    setBackupsLoading(true);
    try {
      const list = await adminService.listBackups();
      setBackups(list);
    } catch (error) {
      console.error("Failed to load backups:", error);
      // Silently fail — backups list may be empty on fresh install
    } finally {
      setBackupsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleBackup = async () => {
    setBackupLoading(true);
    setConfirmModal(null);
    try {
      const result = await adminService.triggerBackup();
      showToast(`Backup successful! File: ${result.file}`, "success");
      // Refresh backup list
      fetchBackups();
    } catch (error) {
      console.error("Backup failed:", error);
      showToast("Backup failed. Check console for details.", "error");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    const filename = useManual ? manualFilename.trim() : selectedBackup;
    if (!filename) {
      showToast("Please select or enter a backup filename", "error");
      return;
    }
    setRestoreLoading(true);
    setConfirmModal(null);
    try {
      const result = await adminService.restoreBackup(filename);
      showToast(result.message, "success");
    } catch (error: unknown) {
      console.error("Restore failed:", error);
      const msg =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Restore failed"
          : "Restore failed. Check console for details.";
      showToast(msg, "error");
    } finally {
      setRestoreLoading(false);
    }
  };

  const restoreFilename = useManual ? manualFilename.trim() : selectedBackup;
  const isLoading = backupLoading || restoreLoading;

  const inputCls =
    "w-full p-3 rounded-lg border border-dark-border bg-dark-bg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50 placeholder-gray-500";

  return (
    <div className="w-full min-h-screen bg-dark-bg text-white font-[Inter,system-ui,sans-serif] p-6 lg:p-8">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <h1 className="text-2xl lg:text-3xl font-bold mb-8">Backup &amp; Restore</h1>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Backup Card */}
        <div className="bg-dark-panel rounded-2xl border border-dark-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400">
              <FaDatabase size={18} />
            </div>
            <h2 className="text-lg font-semibold">Create Backup</h2>
          </div>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Create a backup of the current database. This will save all data to a file on the server.
          </p>
          <button
            onClick={() =>
              setConfirmModal({
                title: "Create Backup",
                message: "Are you sure you want to create a database backup? This may take a moment.",
                action: handleBackup,
              })
            }
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDatabase size={14} />
            {backupLoading ? "Creating backup…" : "Create Backup"}
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-dark-panel rounded-2xl border border-dark-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
              <FaUpload size={18} />
            </div>
            <h2 className="text-lg font-semibold">Restore from Backup</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            Restore the database from a backup file. This will replace current data.
          </p>

          {/* Backup selector */}
          <div className="mb-4">
            <label htmlFor="br-select" className="block text-sm font-medium text-gray-400 mb-1.5">
              Select Backup
            </label>
            {backupsLoading ? (
              <div className="text-gray-500 text-sm py-2 flex items-center gap-2">
                <FaSync className="animate-spin" size={12} /> Loading backups…
              </div>
            ) : backups.length > 0 && !useManual ? (
              <select
                id="br-select"
                value={selectedBackup}
                onChange={(e) => setSelectedBackup(e.target.value)}
                className={inputCls}
              >
                <option value="">— Choose a backup —</option>
                {backups
                  .filter((b) => b.status === "SUCCESS")
                  .map((b) => (
                    <option key={b.id} value={b.filename}>
                      {b.filename} ({formatBytes(b.sizeBytes)} — {new Date(b.createdAt).toLocaleString()})
                    </option>
                  ))}
              </select>
            ) : !useManual ? (
              <p className="text-gray-500 text-sm py-2">No backups found.</p>
            ) : null}

            {/* Manual filename input */}
            {useManual && (
              <input
                id="br-filename"
                type="text"
                value={manualFilename}
                onChange={(e) => setManualFilename(e.target.value)}
                placeholder="backup_2025-11-28_14-30-00.sql"
                className={inputCls}
              />
            )}

            <button
              type="button"
              onClick={() => {
                setUseManual(!useManual);
                setSelectedBackup("");
                setManualFilename("");
              }}
              className="text-xs text-purple-400 hover:text-purple-300 mt-2 transition-colors"
            >
              {useManual ? "← Select from list" : "Enter filename manually"}
            </button>
          </div>

          <button
            onClick={() =>
              setConfirmModal({
                title: "Restore Database",
                message:
                  "WARNING: This will restore the database from the backup. Current data may be lost. This action cannot be undone.",
                action: handleRestore,
                danger: true,
              })
            }
            disabled={isLoading || !restoreFilename}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaUpload size={14} />
            {restoreLoading ? "Restoring…" : "Restore Backup"}
          </button>
        </div>
      </div>

      {/* Backup History */}
      {backups.length > 0 && (
        <div className="bg-dark-panel rounded-2xl border border-dark-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Backup History</h2>
            <button
              onClick={fetchBackups}
              disabled={backupsLoading}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Refresh"
            >
              <FaSync size={14} className={backupsLoading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-dark-border">
                  <th className="text-left py-2 pr-4 font-medium">Filename</th>
                  <th className="text-left py-2 pr-4 font-medium">Size</th>
                  <th className="text-left py-2 pr-4 font-medium">Created</th>
                  <th className="text-left py-2 pr-4 font-medium">By</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.id} className="border-b border-dark-border/50">
                    <td className="py-2.5 pr-4 text-white font-mono text-xs">{b.filename}</td>
                    <td className="py-2.5 pr-4 text-gray-400">{formatBytes(b.sizeBytes)}</td>
                    <td className="py-2.5 pr-4 text-gray-400">{new Date(b.createdAt).toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-gray-400">{b.createdBy}</td>
                    <td className="py-2.5">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          b.status === "SUCCESS"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Important notes */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FaInfoCircle className="text-amber-400" />
          <h3 className="font-semibold text-amber-400 text-sm">Important Notes</h3>
        </div>
        <ul className="list-disc list-inside text-amber-300/80 text-sm space-y-1.5 ml-1">
          <li>Backups are stored on the server filesystem</li>
          <li>Restore operation will overwrite current data</li>
          <li>Only filenames with alphanumeric characters, underscores, hyphens, and .sql extension are accepted</li>
          <li>Keep backup files in a secure location</li>
        </ul>
      </div>

      {/* ── Confirm Modal ── */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  confirmModal.danger ? "bg-red-500/15 text-red-400" : "bg-blue-500/15 text-blue-400"
                }`}
              >
                <FaExclamationTriangle size={18} />
              </div>
              <h2 className="text-lg font-bold text-white">{confirmModal.title}</h2>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">{confirmModal.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-gray-300 hover:bg-dark-border text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.action}
                className={`px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${
                  confirmModal.danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BackupRestore;
