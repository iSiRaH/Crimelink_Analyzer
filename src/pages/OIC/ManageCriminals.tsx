import {
  useRef,
  useState,
  useEffect,
  useCallback,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  FaCloudUploadAlt,
  FaTimes,
  FaCheckCircle,
  FaPlus,
  FaSearch,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaUser,
  FaShieldAlt,
  FaCamera,
  FaIdCard,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSave,
} from "react-icons/fa";
import api from "../../services/api";

/* ─── constants ─── */
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

/* ─── types ─── */
interface CriminalRecord {
  id: string;
  name: string;
  nic: string;
  risk_level: string | null;
  primary_photo_url: string | null;
  status: string | null;
  has_embedding: boolean;
}

interface CriminalDetail {
  id: string;
  name: string;
  nic: string;
  risk_level: string | null;
  crime_history: string | null;
  primary_photo_url: string | null;
  status: string | null;
  address: string | null;
  contact_number: string | null;
  secondary_contact: string | null;
  date_of_birth: string | null;
  gender: string | null;
  alias: string | null;
  has_embedding: boolean;
  photos: { photo_id: number; url: string; is_primary: boolean; quality: number }[];
}

/* ─── Crime Record types & helpers ─── */
interface CrimeRecord {
  date: string;
  type: string;
  location: string;
  description: string;
}

function parseCrimeHistory(raw: string): CrimeRecord[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.records)) return parsed.records;
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    // Plain-text fallback: treat as a single record description
    if (raw.trim()) {
      return [{ date: "", type: "", location: "", description: raw.trim() }];
    }
    return [];
  }
}

function serializeCrimeHistory(records: CrimeRecord[]): string {
  if (records.length === 0) return "";
  const crimeTypes = [
    ...new Set(records.map((r) => r.type.toLowerCase()).filter(Boolean)),
  ];
  const dates = records
    .map((r) => r.date)
    .filter(Boolean)
    .sort()
    .reverse();
  return JSON.stringify({
    records,
    crime_types: crimeTypes,
    total_crimes: records.length,
    last_crime_date: dates[0] || "",
  });
}

/* ─── CrimeRecordEditor ─── */
function CrimeRecordEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (json: string) => void;
}) {
  const [records, setRecords] = useState<CrimeRecord[]>(() =>
    parseCrimeHistory(value)
  );

  // push serialised value to parent whenever records change
  useEffect(() => {
    onChange(serializeCrimeHistory(records));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);

  const update = (idx: number, field: keyof CrimeRecord, val: string) =>
    setRecords((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
    );

  const add = () =>
    setRecords((prev) => [
      ...prev,
      {
        date: new Date().toISOString().slice(0, 10),
        type: "",
        location: "",
        description: "",
      },
    ]);

  const remove = (idx: number) =>
    setRecords((prev) => prev.filter((_, i) => i !== idx));

  const fieldInput =
    "rounded-lg bg-white/10 border border-white/20 h-[36px] px-3 text-white text-sm outline-none w-full focus:border-blue-400 transition-colors";
  const smLabel = "text-xs text-gray-400 mb-0.5";

  return (
    <div className="flex flex-col gap-3">
      {records.length === 0 && (
        <p className="text-gray-500 text-sm italic">No crime records yet.</p>
      )}

      {records.map((rec, idx) => (
        <div
          key={idx}
          className="rounded-xl bg-[#0b0c1a]/60 border border-white/10 p-4 flex flex-col gap-3"
        >
          {/* header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-300">
              Record #{idx + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(idx)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg p-1.5 transition-colors"
              title="Remove record"
            >
              <FaTrash className="text-xs" />
            </button>
          </div>

          {/* fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className={smLabel}>Date</label>
              <input
                type="date"
                value={rec.date}
                onChange={(e) => update(idx, "date", e.target.value)}
                className={fieldInput}
              />
            </div>
            <div className="flex flex-col">
              <label className={smLabel}>Crime Type</label>
              <input
                type="text"
                placeholder="e.g. Robbery, Fraud"
                value={rec.type}
                onChange={(e) => update(idx, "type", e.target.value)}
                className={fieldInput}
              />
            </div>
            <div className="flex flex-col">
              <label className={smLabel}>Location</label>
              <input
                type="text"
                placeholder="e.g. Colombo"
                value={rec.location}
                onChange={(e) => update(idx, "location", e.target.value)}
                className={fieldInput}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className={smLabel}>Description</label>
            <textarea
              placeholder="Brief description of the crime..."
              value={rec.description}
              onChange={(e) => update(idx, "description", e.target.value)}
              className="rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white text-sm outline-none resize-none w-full focus:border-blue-400 transition-colors"
              rows={2}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-dashed border-white/30 hover:border-green-400/60 hover:bg-green-500/10 px-4 py-2.5 text-sm text-gray-300 hover:text-green-300 transition-colors flex items-center gap-2 justify-center"
      >
        <FaPlus className="text-xs" /> Add Crime Record
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ManageCriminals – list + add + edit
   ═══════════════════════════════════════════════════════════ */
function ManageCriminals() {
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editId, setEditId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditId(id);
    setView("edit");
  };

  if (view === "add") {
    return <AddCriminalForm onBack={() => setView("list")} />;
  }
  if (view === "edit" && editId) {
    return <EditCriminalForm criminalId={editId} onBack={() => setView("list")} />;
  }
  return <CriminalsListView onAdd={() => setView("add")} onEdit={handleEdit} />;
}

/* ═══════════════════════════════════════════════════════════
   LIST VIEW
   ═══════════════════════════════════════════════════════════ */
function CriminalsListView({ onAdd, onEdit }: { onAdd: () => void; onEdit: (id: string) => void }) {
  const [criminals, setCriminals] = useState<CriminalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<CriminalRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCriminals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/criminals");
      setCriminals(res.data as CriminalRecord[]);
    } catch {
      setError("Failed to load criminals. Ensure services are running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCriminals();
  }, [fetchCriminals]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/criminals/${deleteTarget.id}`);
      setCriminals((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete criminal. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = criminals
    .filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.nic.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter;
      const matchesRisk =
        riskFilter === "All" || c.risk_level === riskFilter;
      return matchesSearch && matchesStatus && matchesRisk;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const riskColor = (r: string | null) => {
    switch (r) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const statusColor = (s: string | null) => {
    switch (s) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/40";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
      case "archived":
        return "bg-purple-500/20 text-purple-400 border-purple-500/40";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/40";
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c1a] text-white p-4 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="bg-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="font-semibold text-3xl">Manage Criminals</h1>
          <button
            onClick={onAdd}
            className="rounded-md bg-[#22c55e] px-5 py-2.5 text-sm font-bold hover:bg-[#16a34a] transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <FaPlus /> Add New Criminal
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:w-[300px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, NIC, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-xl border-none pl-10 pr-4 text-sm bg-white text-[#0b0c1a] outline-none"
            />
          </div>
          <select
            title="Status filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 rounded-xl border border-white/20 bg-white text-[#0b0c1a] text-sm font-semibold cursor-pointer min-w-[120px]"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
          <select
            title="Risk filter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="h-10 px-4 rounded-xl border border-white/20 bg-white text-[#0b0c1a] text-sm font-semibold cursor-pointer min-w-[120px]"
          >
            <option value="All">All Risk</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={fetchCriminals}
            disabled={loading}
            className="h-10 px-5 rounded-lg bg-blue-600 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Count */}
        <p className="text-sm text-gray-400">
          {loading
            ? "Loading..."
            : `${filtered.length} criminal${filtered.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm flex items-center gap-2">
          <FaTimes className="shrink-0" /> {error}
        </div>
      )}

      {/* Table / Cards */}
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            <span className="text-gray-400 text-lg">Loading criminals...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-xl mb-2">No criminals found</p>
            <p className="text-sm">
              {criminals.length === 0
                ? 'Click "Add New Criminal" to register the first criminal.'
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3">Photo</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">NIC</th>
                  <th className="px-5 py-3">Risk</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Face Data</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onEdit(c.id)}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      {c.primary_photo_url ? (
                        <img
                          src={c.primary_photo_url}
                          alt={c.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium">{c.name}</td>
                    <td className="px-5 py-3 text-gray-300 text-sm font-mono">
                      {c.nic || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${riskColor(c.risk_level)}`}
                      >
                        {c.risk_level ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor(c.status)}`}
                      >
                        {c.status ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {c.has_embedding ? (
                        <span className="text-green-400 text-xs flex items-center gap-1">
                          <FaCheckCircle /> Registered
                        </span>
                      ) : (
                        <span className="text-yellow-400 text-xs">
                          No embedding
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(c.id);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                        title="Edit criminal"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(c);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                        title="Delete criminal"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#141829] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-3">Delete Criminal</h3>
            <p className="text-gray-300 text-sm mb-1">
              Are you sure you want to permanently delete this criminal?
            </p>
            <div className="flex items-center gap-3 my-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              {deleteTarget.primary_photo_url ? (
                <img
                  src={deleteTarget.primary_photo_url}
                  alt={deleteTarget.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                  N/A
                </div>
              )}
              <div>
                <p className="text-white font-medium text-sm">{deleteTarget.name}</p>
                <p className="text-gray-400 text-xs font-mono">{deleteTarget.nic}</p>
              </div>
            </div>
            <p className="text-red-400 text-xs mb-4">
              This action cannot be undone. All associated photos and face data will be removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white border border-white/10 hover:border-white/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="w-3 h-3" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADD CRIMINAL FORM
   ═══════════════════════════════════════════════════════════ */
function AddCriminalForm({ onBack }: { onBack: () => void }) {
  /* --- form state --- */
  const [name, setName] = useState("");
  const [nic, setNic] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [secondaryContact, setSecondaryContact] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [alias, setAlias] = useState("");
  const [crimeHistory, setCrimeHistory] = useState("");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [status, setStatus] = useState("active");
  const [formKey, setFormKey] = useState(0);

  /* --- photo state --- */
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* --- UI state --- */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* --- file helpers --- */
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type))
      return "Only JPG and PNG images are allowed.";
    if (file.size > MAX_FILE_SIZE) return "File size must not exceed 5 MB.";
    return null;
  };

  const setPhotoFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPhotoFile(e.target.files[0]);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) setPhotoFile(e.dataTransfer.files[0]);
  };
  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setName("");
    setNic("");
    setContactNumber("");
    setSecondaryContact("");
    setAddress("");
    setDateOfBirth("");
    setGender("");
    setAlias("");
    setCrimeHistory("");
    setRiskLevel("medium");
    setStatus("active");
    setFormKey((k) => k + 1);
    removePhoto();
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("Full Name is required.");
      return false;
    }
    if (!nic.trim()) {
      setError("NIC is required.");
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fd = new FormData();
      if (photo) fd.append("photo", photo);
      fd.append("name", name.trim());
      fd.append("nic", nic.trim());
      fd.append("risk_level", riskLevel);
      fd.append("status", status);
      if (crimeHistory.trim()) fd.append("crime_history", crimeHistory.trim());
      if (address.trim()) fd.append("address", address.trim());
      if (contactNumber.trim())
        fd.append("contact_number", contactNumber.trim());
      if (secondaryContact.trim())
        fd.append("secondary_contact", secondaryContact.trim());
      if (dateOfBirth) fd.append("date_of_birth", dateOfBirth);
      if (gender) fd.append("gender", gender);
      if (alias.trim()) fd.append("alias", alias.trim());

      const res = await api.post("/criminals", fd);
      const data = res.data;
      setSuccess(
        `Criminal registered! ID: ${data.criminal_id ?? "N/A"} — ${data.photos_stored ?? 0} photo(s) stored.`
      );
      resetForm();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const ax = err as {
          response?: { data?: { error?: string; detail?: string } };
        };
        setError(
          ax.response?.data?.error ||
            ax.response?.data?.detail ||
            "Registration failed."
        );
      } else {
        setError("Network error. Ensure the backend services are running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "rounded-[13px] bg-white h-[40px] px-4 text-[#0b0c1a] text-sm outline-none w-full";
  const labelClass = "text-base sm:text-lg font-medium";

  return (
    <div className="w-full min-h-screen bg-[#0b0c1a] text-white flex flex-col">
      <div className="bg-slate-800 p-5 rounded-lg m-4 sm:m-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={onBack}
            className="rounded-lg bg-white/10 hover:bg-white/20 p-2.5 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="font-semibold text-3xl">Add New Criminal</h1>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm flex items-center gap-2">
            <FaTimes className="shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-sm flex items-center gap-2">
            <FaCheckCircle className="shrink-0" /> {success}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Left: Personal Details */}
          <div className="bg-[#181d30] rounded-[40px] sm:rounded-[54px] shadow p-6 sm:p-8 flex flex-col gap-4">
            <h2 className="font-medium text-2xl sm:text-[28px] mb-1">
              Personal Details
            </h2>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>
                NIC / National ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter NIC number"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Phone Number</label>
                <input
                  type="text"
                  placeholder="Contact number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Secondary Contact</label>
                <input
                  type="text"
                  placeholder="Secondary number"
                  value={secondaryContact}
                  onChange={(e) => setSecondaryContact(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Address</label>
              <textarea
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-[13px] bg-white min-h-[53px] px-4 py-3 text-[#0b0c1a] text-sm outline-none resize-none w-full"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className={labelClass}>Gender</label>
                <select
                  title="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled hidden>
                    Select Gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Alias / Known As</label>
              <input
                type="text"
                placeholder="Known alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Right: Crime Details + Photo */}
          <div className="flex flex-col gap-5">
            {/* Crime Details */}
            <div className="bg-[#181d30] rounded-[40px] sm:rounded-[54px] shadow p-6 sm:p-8 flex flex-col gap-4">
              <h2 className="font-medium text-2xl sm:text-[28px] mb-1">
                Crime Details
              </h2>

              <div className="flex flex-col gap-1">
                <label className={labelClass}>Crime History</label>
                <CrimeRecordEditor
                  key={formKey}
                  value={crimeHistory}
                  onChange={setCrimeHistory}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Risk Level</label>
                  <select
                    title="risk_level"
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className={inputClass}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className={labelClass}>Status</label>
                  <select
                    title="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-[#181d30] rounded-[40px] sm:rounded-[54px] shadow p-6 sm:p-8 flex flex-col gap-4">
              <h2 className="font-medium text-2xl sm:text-[28px] mb-1">
                Photo <span className="text-red-400">*</span>
              </h2>

              {!photo ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-[13px] border border-dashed border-white/50 min-h-[180px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors duration-200
                    ${isDragActive ? "border-2 border-[#22c55e] bg-[rgba(34,197,94,0.1)]" : ""}`}
                >
                  <FaCloudUploadAlt className="w-16 h-16 sm:w-[75px] sm:h-[75px] text-white/70" />
                  <span className="text-white/50 text-sm">
                    {isDragActive
                      ? "Drop image here!"
                      : "Drag & Drop a photo here"}
                  </span>
                  <span className="text-white/30 text-xs">
                    JPG or PNG, max 5 MB
                  </span>
                  <button
                    type="button"
                    className="rounded-md bg-[#22c55e] px-5 py-2 text-sm font-bold hover:bg-[#16a34a] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Upload Photo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <img
                      src={photoPreview!}
                      alt="Preview"
                      className="w-48 h-48 object-cover rounded-xl border-2 border-[#22c55e]/50"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 py-2 px-3 bg-[rgba(34,197,94,0.15)] rounded-md border border-[rgba(34,197,94,0.3)]">
                    <span className="text-white text-[13px] overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                      {photo.name}
                    </span>
                    <span className="text-white/50 text-xs">
                      ({(photo.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-5">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="rounded-md bg-[#3b82f6] px-8 py-2.5 font-bold hover:bg-[#2563eb] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Registering...
              </>
            ) : (
              "Register Criminal"
            )}
          </button>
          <button
            onClick={resetForm}
            disabled={loading}
            className="rounded-md bg-[#f97316] px-8 py-2.5 font-bold hover:bg-[#ea580c] transition-colors disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EDIT CRIMINAL FORM
   ═══════════════════════════════════════════════════════════ */
function EditCriminalForm({
  criminalId,
  onBack,
}: {
  criminalId: string;
  onBack: () => void;
}) {
  /* --- form state --- */
  const [name, setName] = useState("");
  const [nic, setNic] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [secondaryContact, setSecondaryContact] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [alias, setAlias] = useState("");
  const [crimeHistory, setCrimeHistory] = useState("");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [status, setStatus] = useState("active");

  /* --- tabs --- */
  const [activeTab, setActiveTab] = useState<"personal" | "crime" | "photo">(
    "personal"
  );

  /* --- photo state --- */
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* --- UI state --- */
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* --- load existing data --- */
  useEffect(() => {
    const fetchCriminal = async () => {
      setFetchLoading(true);
      setError(null);
      try {
        const res = await api.get(`/criminals/${criminalId}`);
        const d = res.data as CriminalDetail;
        setName(d.name ?? "");
        setNic(d.nic ?? "");
        setContactNumber(d.contact_number ?? "");
        setSecondaryContact(d.secondary_contact ?? "");
        setAddress(d.address ?? "");
        setDateOfBirth(d.date_of_birth ?? "");
        setGender(d.gender ?? "");
        setAlias(d.alias ?? "");
        setCrimeHistory(d.crime_history ?? "");
        setRiskLevel(d.risk_level ?? "medium");
        setStatus(d.status ?? "active");
        setExistingPhotoUrl(d.primary_photo_url);
      } catch {
        setError("Failed to load criminal data.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchCriminal();
  }, [criminalId]);

  /* --- file helpers --- */
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type))
      return "Only JPG and PNG images are allowed.";
    if (file.size > MAX_FILE_SIZE) return "File size must not exceed 5 MB.";
    return null;
  };

  const setPhotoFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPhotoFile(e.target.files[0]);
  };
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) setPhotoFile(e.dataTransfer.files[0]);
  };
  const removeNewPhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Full Name is required.");
      setActiveTab("personal");
      return;
    }
    if (!nic.trim()) {
      setError("NIC is required.");
      setActiveTab("personal");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("nic", nic.trim());
      fd.append("risk_level", riskLevel);
      fd.append("status", status);
      if (crimeHistory.trim()) fd.append("crime_history", crimeHistory.trim());
      if (address.trim()) fd.append("address", address.trim());
      if (contactNumber.trim())
        fd.append("contact_number", contactNumber.trim());
      if (secondaryContact.trim())
        fd.append("secondary_contact", secondaryContact.trim());
      if (dateOfBirth) fd.append("date_of_birth", dateOfBirth);
      if (gender) fd.append("gender", gender);
      if (alias.trim()) fd.append("alias", alias.trim());
      if (photo) fd.append("photo", photo);

      await api.put(`/criminals/${criminalId}`, fd);
      setSuccess("Criminal record updated successfully!");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const ax = err as {
          response?: { data?: { error?: string; detail?: string } };
        };
        setError(
          ax.response?.data?.error ||
            ax.response?.data?.detail ||
            "Update failed."
        );
      } else {
        setError("Network error. Ensure the backend services are running.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* --- style helpers --- */
  const inputClass =
    "rounded-xl bg-[#0b0c1a]/80 border border-white/10 h-[42px] px-4 text-white text-sm outline-none w-full focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-gray-500";
  const labelClass = "text-sm font-medium text-gray-300 flex items-center gap-2";
  const sectionTitle = "text-lg font-semibold text-white flex items-center gap-2.5";

  const riskColors: Record<string, string> = {
    low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    archived: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  const displayPreview = photoPreview ?? existingPhotoUrl;

  const tabBtn = (
    tab: "personal" | "crime" | "photo",
    icon: React.ReactNode,
    label: string
  ) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
        activeTab === tab
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  /* --- loading --- */
  if (fetchLoading) {
    return (
      <div className="w-full min-h-screen bg-[#0b0c1a] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500/20 border-t-blue-500" />
            <FaUser className="absolute inset-0 m-auto text-blue-400 text-sm" />
          </div>
          <span className="text-gray-400">Loading criminal record...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0b0c1a] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <FaArrowLeft className="text-xs" /> Back to List
          </button>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${riskColors[riskLevel] ?? riskColors.medium}`}
            >
              {riskLevel.toUpperCase()} RISK
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status] ?? statusColors.active}`}
            >
              {status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ── Profile Header Card ── */}
        <div className="bg-gradient-to-r from-[#141829] to-[#1a1f38] rounded-2xl border border-white/5 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Photo thumbnail */}
            <div className="relative shrink-0">
              {displayPreview ? (
                <img
                  src={displayPreview}
                  alt={name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-white/10 flex items-center justify-center">
                  <FaUser className="text-gray-600 text-2xl" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("photo")}
                className="absolute -bottom-1.5 -right-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg p-1.5 transition-colors"
                title="Change photo"
              >
                <FaCamera className="text-[10px] text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">
                {name || "Unnamed Criminal"}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-gray-400">
                {nic && (
                  <span className="flex items-center gap-1.5">
                    <FaIdCard className="text-xs text-gray-500" /> {nic}
                  </span>
                )}
                {alias && (
                  <span className="flex items-center gap-1.5">
                    aka <span className="text-gray-300 italic">{alias}</span>
                  </span>
                )}
                {gender && <span>{gender}</span>}
                {dateOfBirth && (
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="text-xs text-gray-500" />{" "}
                    {dateOfBirth}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1.5 font-mono">
                ID: {criminalId}
              </p>
            </div>

            {/* Save button (desktop) */}
            <button
              onClick={onSubmit}
              disabled={loading}
              className="hidden sm:flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="text-xs" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
            <div className="mt-0.5 shrink-0 bg-red-500/20 rounded-lg p-1.5">
              <FaTimes className="text-xs" />
            </div>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-5 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm flex items-start gap-3">
            <div className="mt-0.5 shrink-0 bg-green-500/20 rounded-lg p-1.5">
              <FaCheckCircle className="text-xs" />
            </div>
            <span>{success}</span>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabBtn("personal", <FaUser className="text-xs" />, "Personal Info")}
          {tabBtn(
            "crime",
            <FaShieldAlt className="text-xs" />,
            "Crime Details"
          )}
          {tabBtn("photo", <FaCamera className="text-xs" />, "Photo")}
        </div>

        {/* ══════════ PERSONAL TAB ══════════ */}
        {activeTab === "personal" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Identity */}
            <div className="bg-[#141829] rounded-2xl border border-white/5 p-6 flex flex-col gap-5">
              <h3 className={sectionTitle}>
                <span className="bg-blue-600/20 rounded-lg p-1.5">
                  <FaIdCard className="text-blue-400 text-xs" />
                </span>
                Identity
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  NIC / National ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter NIC number"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Alias / Known As</label>
                <input
                  type="text"
                  placeholder="Known alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>
                    <FaCalendarAlt className="text-xs text-gray-500" /> Date of
                    Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Gender</label>
                  <select
                    title="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled hidden>
                      Select
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact & Address */}
            <div className="bg-[#141829] rounded-2xl border border-white/5 p-6 flex flex-col gap-5">
              <h3 className={sectionTitle}>
                <span className="bg-emerald-600/20 rounded-lg p-1.5">
                  <FaPhone className="text-emerald-400 text-xs" />
                </span>
                Contact & Address
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>
                    <FaPhone className="text-xs text-gray-500" /> Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Contact number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Secondary Contact</label>
                  <input
                    type="text"
                    placeholder="Secondary number"
                    value={secondaryContact}
                    onChange={(e) => setSecondaryContact(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  <FaMapMarkerAlt className="text-xs text-gray-500" /> Address
                </label>
                <textarea
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl bg-[#0b0c1a]/80 border border-white/10 px-4 py-3 text-white text-sm outline-none resize-none w-full focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-gray-500"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* ══════════ CRIME TAB ══════════ */}
        {activeTab === "crime" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Crime History — takes 2 cols */}
            <div className="lg:col-span-2 bg-[#141829] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
              <h3 className={sectionTitle}>
                <span className="bg-red-600/20 rounded-lg p-1.5">
                  <FaShieldAlt className="text-red-400 text-xs" />
                </span>
                Crime History
              </h3>
              <CrimeRecordEditor
                value={crimeHistory}
                onChange={setCrimeHistory}
              />
            </div>

            {/* Status & Risk */}
            <div className="bg-[#141829] rounded-2xl border border-white/5 p-6 flex flex-col gap-5">
              <h3 className={sectionTitle}>
                <span className="bg-yellow-600/20 rounded-lg p-1.5">
                  <FaShieldAlt className="text-yellow-400 text-xs" />
                </span>
                Classification
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Risk Level</label>
                <select
                  title="risk_level"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  className={inputClass}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                {/* visual risk indicator */}
                <div className="flex items-center gap-1.5 mt-2">
                  {["low", "medium", "high", "critical"].map((lvl) => (
                    <div
                      key={lvl}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        ["low", "medium", "high", "critical"].indexOf(
                          riskLevel
                        ) >=
                        ["low", "medium", "high", "critical"].indexOf(lvl)
                          ? lvl === "critical"
                            ? "bg-red-500"
                            : lvl === "high"
                              ? "bg-orange-500"
                              : lvl === "medium"
                                ? "bg-yellow-500"
                                : "bg-emerald-500"
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 mt-0.5">
                  {riskLevel === "critical"
                    ? "Extremely dangerous — top priority"
                    : riskLevel === "high"
                      ? "Significant threat level"
                      : riskLevel === "medium"
                        ? "Moderate risk — monitor closely"
                        : "Low risk — routine monitoring"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Status</label>
                <select
                  title="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      status === "active"
                        ? "bg-emerald-400 shadow shadow-emerald-400/50"
                        : status === "inactive"
                          ? "bg-gray-400"
                          : "bg-purple-400"
                    }`}
                  />
                  <span className="text-xs text-gray-500 capitalize">
                    {status === "active"
                      ? "Currently active in system"
                      : status === "inactive"
                        ? "Marked inactive"
                        : "Archived — read only"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ PHOTO TAB ══════════ */}
        {activeTab === "photo" && (
          <div className="max-w-xl mx-auto">
            <div className="bg-[#141829] rounded-2xl border border-white/5 p-6 flex flex-col gap-4">
              <h3 className={sectionTitle}>
                <span className="bg-violet-600/20 rounded-lg p-1.5">
                  <FaCamera className="text-violet-400 text-xs" />
                </span>
                Criminal Photo
              </h3>
              <p className="text-gray-500 text-xs -mt-2">
                Upload a new photo to replace the existing one. Accepted
                formats: JPG, PNG (max 5 MB).
              </p>

              {!photo && !displayPreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-2xl border-2 border-dashed min-h-[240px] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-200 ${
                    isDragActive
                      ? "border-blue-500 bg-blue-500/5"
                      : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="bg-white/5 rounded-2xl p-5">
                    <FaCloudUploadAlt className="w-10 h-10 text-gray-500" />
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400 text-sm block">
                      {isDragActive
                        ? "Drop your image here"
                        : "Drag & drop a photo here"}
                    </span>
                    <span className="text-gray-600 text-xs mt-1 block">
                      or click to browse
                    </span>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2 text-sm font-semibold transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Choose File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <img
                      src={displayPreview!}
                      alt="Preview"
                      className="w-56 h-56 object-cover rounded-2xl border-2 border-white/10 shadow-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {photo ? (
                        <button
                          type="button"
                          onClick={removeNewPhoto}
                          className="bg-red-500 hover:bg-red-400 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                        >
                          Replace
                        </button>
                      )}
                    </div>
                  </div>
                  {photo ? (
                    <div className="flex items-center gap-2 py-2 px-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <FaCheckCircle className="text-blue-400 text-xs" />
                      <span className="text-white text-sm truncate max-w-[200px]">
                        {photo.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        ({(photo.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs">
                      Current photo — hover to replace
                    </span>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Mobile Save + Cancel ── */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
          <button
            onClick={onBack}
            disabled={loading}
            className="rounded-xl bg-white/5 border border-white/10 px-8 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="sm:hidden flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-8 py-2.5 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="text-xs" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageCriminals;
