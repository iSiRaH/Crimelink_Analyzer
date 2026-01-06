import { useState } from "react";
import * as adminService from "../../api/adminService";

function BackupRestore() {
  const [loading, setLoading] = useState(false);
  const [backupFile, setBackupFile] = useState("");

  const handleBackup = async () => {
    if (!confirm("Are you sure you want to create a database backup?")) return;

    setLoading(true);
    try {
      const result = await adminService.triggerBackup();
      alert(`Backup successful! File: ${result.file}`);
    } catch (error) {
      console.error("Backup failed:", error);
      alert("Backup failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!backupFile.trim()) {
      alert("Please enter a backup filename");
      return;
    }

    if (
      !confirm(
        "WARNING: This will restore the database from the backup. Current data may be lost. Continue?"
      )
    )
      return;

    setLoading(true);
    try {
      const result = await adminService.restoreBackup(backupFile);
      alert(result.message);
    } catch (error) {
      console.error("Restore failed:", error);
      alert("Restore failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-500 h-full">
      <h1 className="text-3xl font-semibold mb-6">Backup & Restore</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Section */}
        <div className="border rounded-lg p-6 bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Create Backup</h2>
          <p className="text-gray-600 mb-4">
            Create a backup of the current database. This will save all data to a
            file.
          </p>
          <button
            onClick={handleBackup}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Creating Backup..." : "Create Backup"}
          </button>
        </div>

        {/* Restore Section */}
        <div className="border rounded-lg p-6 bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Restore from Backup</h2>
          <p className="text-gray-600 mb-4">
            Restore the database from a backup file. This will replace current
            data.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Backup Filename
            </label>
            <input
              type="text"
              value={backupFile}
              onChange={(e) => setBackupFile(e.target.value)}
              placeholder="backup_2025-11-28.sql"
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <button
            onClick={handleRestore}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? "Restoring..." : "Restore Backup"}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
        <ul className="list-disc list-inside text-yellow-700 space-y-1">
          <li>Backups are stored on the server filesystem</li>
          <li>Restore operation will overwrite current data</li>
          <li>Consider scheduling automatic backups daily</li>
          <li>Keep backup files in a secure location</li>
        </ul>
      </div>
    </div>
  );
}

export default BackupRestore;
