import { useState } from "react";
import * as adminService from "../../api/adminService";
import {
  FaDatabase,
  FaUpload,
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
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

/* ═══════════════ main component ═══════════════ */
function BackupRestore() {
  const [loading, setLoading] = useState(false);
  const [backupFile, setBackupFile] = useState("");
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

  const handleBackup = async () => {
    setLoading(true);
    setConfirmModal(null);
    try {
      const result = await adminService.triggerBackup();
      showToast(`Backup successful! File: ${result.file}`, "success");
    } catch (error) {
      console.error("Backup failed:", error);
      showToast("Backup failed. Check console for details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!backupFile.trim()) {
      showToast("Please enter a backup filename", "error");
      return;
    }
    setLoading(true);
    setConfirmModal(null);
    try {
      const result = await adminService.restoreBackup(backupFile);
      showToast(result.message, "success");
    } catch (error) {
      console.error("Restore failed:", error);
      showToast("Restore failed. Check console for details.", "error");
    } finally {
      setLoading(false);
    }
  };

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
            disabled={loading}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDatabase size={14} />
            {loading ? "Processing…" : "Create Backup"}
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
          <div className="mb-4">
            <label htmlFor="br-filename" className="block text-sm font-medium text-gray-400 mb-1.5">
              Backup Filename
            </label>
            <input
              id="br-filename"
              type="text"
              value={backupFile}
              onChange={(e) => setBackupFile(e.target.value)}
              placeholder="backup_2025-11-28.sql"
              className={inputCls}
            />
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
            disabled={loading || !backupFile.trim()}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaUpload size={14} />
            {loading ? "Processing…" : "Restore Backup"}
          </button>
        </div>
      </div>

      {/* Important notes */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FaInfoCircle className="text-amber-400" />
          <h3 className="font-semibold text-amber-400 text-sm">Important Notes</h3>
        </div>
        <ul className="list-disc list-inside text-amber-300/80 text-sm space-y-1.5 ml-1">
          <li>Backups are stored on the server filesystem</li>
          <li>Restore operation will overwrite current data</li>
          <li>Consider scheduling automatic backups daily</li>
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
