import { useEffect, useState } from "react";
import * as adminService from "../../api/adminService";
import type { User } from "../../api/adminService";
import { FaPlus, FaEdit, FaBan, FaSearch, FaTimes } from "react-icons/fa";

/* ───────────── tiny helpers ───────────── */
const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-primary" />
    <span className="ml-4 text-gray-400 text-lg">Loading users…</span>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <FaSearch className="mx-auto text-gray-600 text-4xl mb-4" />
    <p className="text-gray-400 text-lg font-medium">No users found</p>
    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or create a new user.</p>
  </div>
);

const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => (
  <div
    className={`fixed top-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-[slideIn_0.3s_ease-out] ${
      type === "success"
        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
        : "bg-red-500/15 border border-red-500/30 text-red-400"
    }`}
  >
    <span className="text-sm font-medium">{message}</span>
    <button onClick={onClose} className="text-current hover:opacity-70 transition-opacity" aria-label="Close notification">
      <FaTimes size={14} />
    </button>
  </div>
);

/* ═══════════════ main component ═══════════════ */
function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Confirm modal
  const [confirmAction, setConfirmAction] = useState<{ userId: number; name: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    dob: "",
    gender: "",
    address: "",
    role: "FieldOfficer",
    badgeNo: "",
    status: "Active",
    passwordHash: "",
  });

  const roles = ["Admin", "OIC", "Investigator", "FieldOfficer"];
  const statuses = ["Active", "Inactive"];

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.badgeNo && u.badgeNo.toLowerCase().includes(q))
      );
    }
    if (roleFilter !== "All") filtered = filtered.filter((u) => u.role === roleFilter);
    if (statusFilter !== "All") filtered = filtered.filter((u) => u.status === statusFilter);
    setFilteredUsers(filtered);
  }, [users, roleFilter, statusFilter, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      dob: "",
      gender: "",
      address: "",
      role: "FieldOfficer",
      badgeNo: "",
      status: "Active",
      passwordHash: "",
    });
    setShowModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user, passwordHash: "" });
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    try {
      await adminService.deactivateUser(userId);
      showToast("User deactivated successfully", "success");
      setConfirmAction(null);
      loadUsers();
    } catch {
      showToast("Failed to deactivate user", "error");
      setConfirmAction(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.userId!, formData);
        showToast("User updated successfully", "success");
      } else {
        await adminService.createUser(formData);
        showToast("User created successfully", "success");
      }
      setShowModal(false);
      loadUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save user";
      showToast(msg, "error");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ─── select classes ─── */
  const selectCls =
    "h-11 px-4 rounded-xl border border-dark-border bg-dark-bg text-white text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-primary/50 transition-colors";
  const inputCls =
    "w-full p-2.5 rounded-lg border border-dark-border bg-dark-bg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50 placeholder-gray-500";

  return (
    <div className="w-full min-h-screen bg-dark-bg text-white font-[Inter,system-ui,sans-serif] p-6 lg:p-8">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">User Management</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-purple-primary hover:bg-purple-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        >
          <FaPlus size={12} /> Create User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-panel rounded-2xl border border-dark-border p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or badge…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 rounded-xl border border-dark-border bg-dark-bg text-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50 placeholder-gray-500"
              aria-label="Search users"
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectCls} aria-label="Filter by role">
            <option value="All">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls} aria-label="Filter by status">
            <option value="All">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : filteredUsers.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-dark-border">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="bg-slate-700 text-white border-b-2 border-dark-border">
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">ID</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">Name</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">Email</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">Badge No</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">Role</th>
                <th className="text-left px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">Status</th>
                <th className="text-center px-4 py-3.5 font-semibold whitespace-nowrap" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-dark-panel">
              {filteredUsers.map((user) => (
                <tr
                  key={user.userId}
                  className="border-b border-dark-border hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400">{user.userId}</td>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-300">{user.email}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{user.badgeNo || "N/A"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-primary/20 text-purple-400">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.status === "Active"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors"
                        aria-label={`Edit ${user.name}`}
                      >
                        <FaEdit size={11} /> Edit
                      </button>
                      <button
                        onClick={() => setConfirmAction({ userId: user.userId!, name: user.name })}
                        disabled={user.status === "Inactive"}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Deactivate ${user.name}`}
                      >
                        <FaBan size={11} /> Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Confirm Deactivate Modal ── */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Confirm deactivation">
          <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-3">Confirm Deactivation</h2>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to deactivate <span className="text-white font-semibold">{confirmAction.name}</span>?
              This action can be reversed by editing the user later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-gray-300 hover:bg-dark-border text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmAction.userId)}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label={editingUser ? "Edit User" : "Create User"}>
          <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingUser ? "Edit User" : "Create User"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="um-name" className="block text-sm font-medium text-gray-400 mb-1.5">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input id="um-name" type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputCls} required />
                </div>

                <div>
                  <label htmlFor="um-email" className="block text-sm font-medium text-gray-400 mb-1.5">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input id="um-email" type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputCls} required />
                </div>

                <div>
                  <label htmlFor="um-dob" className="block text-sm font-medium text-gray-400 mb-1.5">
                    Date of Birth
                  </label>
                  <input id="um-dob" type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inputCls} />
                </div>

                <div>
                  <label htmlFor="um-gender" className="block text-sm font-medium text-gray-400 mb-1.5">
                    Gender
                  </label>
                  <select id="um-gender" name="gender" value={formData.gender} onChange={handleInputChange} className={inputCls}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="um-badge" className="block text-sm font-medium text-gray-400 mb-1.5">
                    Badge No
                  </label>
                  <input id="um-badge" type="text" name="badgeNo" value={formData.badgeNo} onChange={handleInputChange} className={inputCls} />
                </div>

                <div>
                  <label htmlFor="um-role" className="block text-sm font-medium text-gray-400 mb-1.5">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select id="um-role" name="role" value={formData.role} onChange={handleInputChange} className={inputCls} required>
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="um-status" className="block text-sm font-medium text-gray-400 mb-1.5">
                    Status <span className="text-red-400">*</span>
                  </label>
                  <select id="um-status" name="status" value={formData.status} onChange={handleInputChange} className={inputCls} required>
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {!editingUser && (
                  <div>
                    <label htmlFor="um-password" className="block text-sm font-medium text-gray-400 mb-1.5">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="um-password"
                      type="password"
                      name="passwordHash"
                      value={formData.passwordHash}
                      onChange={handleInputChange}
                      className={inputCls}
                      required={!editingUser}
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label htmlFor="um-address" className="block text-sm font-medium text-gray-400 mb-1.5">
                    Address
                  </label>
                  <textarea id="um-address" name="address" value={formData.address} onChange={handleInputChange} className={inputCls} rows={3} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-dark-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-lg bg-dark-bg border border-dark-border text-gray-300 hover:bg-dark-border text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-purple-primary hover:bg-purple-hover text-white text-sm font-semibold transition-colors"
                >
                  {editingUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
