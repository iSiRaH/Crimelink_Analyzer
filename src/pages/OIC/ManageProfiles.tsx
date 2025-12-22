import { useEffect, useState } from "react";
import * as adminService from "../../api/adminService";
import type { User } from "../../api/adminService";

interface FieldOfficer extends User {
  rank?: string;
  assignedArea?: string;
  contactNumber?: string;
  nic?: string;
  badgeNo?: string;
}

function ManageProfiles() {
  const [fieldOfficers, setFieldOfficers] = useState<FieldOfficer[]>([]);
  const [filteredOfficers, setFilteredOfficers] = useState<FieldOfficer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<FieldOfficer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [areaFilter, setAreaFilter] = useState("All");
  const [successMessage, setSuccessMessage] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState<Partial<FieldOfficer>>({
    name: "",
    email: "",
    badgeNo: "",
    rank: "",
    assignedArea: "",
    contactNumber: "",
    nic: "",
    status: "Active",
    passwordHash: "",
  });

  const statuses = ["Active", "Inactive", "Suspended"];
  const ranks = ["Officer", "Sergeant", "Corporal", "Lieutenant"];
  const areas = ["North Sector", "South Sector", "East 16", "West 11"]; // Example areas

  useEffect(() => {
    loadFieldOfficers();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = fieldOfficers;

    // Search
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.badgeNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.assignedArea?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((u) => u.status === statusFilter);
    }

    // Area filter
    if (areaFilter !== "All") {
      filtered = filtered.filter((u) => u.assignedArea === areaFilter);
    }

    setFilteredOfficers(filtered);
  }, [fieldOfficers, searchTerm, statusFilter, areaFilter]);

  const loadFieldOfficers = async () => {
    setLoading(true);
    try {
      const allUsers = await adminService.getAllUsers();
      const officers = allUsers
        .filter((user) => user.role === "FieldOfficer")
        .map((officer) => ({
          ...(officer as FieldOfficer),
          // Map existing fields to new ones if needed
          rank: (officer as FieldOfficer).rank || "Officer",
          assignedArea: (officer as FieldOfficer).assignedArea || "North Sector",
          contactNumber: (officer as FieldOfficer).contactNumber || "555-000-0000",
          nic: (officer as FieldOfficer).nic || "Unknown",
        }));
      setFieldOfficers(officers);
    } catch (error) {
      console.error("Failed to load field officers:", error);
      alert("Failed to load field officers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrEdit = (officer?: User) => {
    if (officer) {
      const fieldOfficer = officer as FieldOfficer;
      setEditingOfficer(fieldOfficer);
      setFormData({
        name: fieldOfficer.name || "",
        email: fieldOfficer.email || "",
        badgeNo: fieldOfficer.badgeNo || "",
        rank: fieldOfficer.rank || "Officer",
        assignedArea: fieldOfficer.assignedArea || "",
        contactNumber: fieldOfficer.contactNumber || "",
        nic: fieldOfficer.nic || "",
        status: fieldOfficer.status || "Active",
        passwordHash: "",
      });
    } else {
      setEditingOfficer(null);
      setFormData({
        name: "",
        email: "",
        badgeNo: "",
        rank: "Officer",
        assignedArea: "",
        contactNumber: "",
        nic: "",
        status: "Active",
        passwordHash: "",
      });
    }
    setShowModal(true);
  };

  const handleDeactivate = async (userId: number) => {
    if (!confirm("Are you sure you want to change this officer's status?")) return;

    try {
      const officer = fieldOfficers.find((o) => o.userId === userId);
      if (!officer) {
        alert("Officer not found");
        return;
      }
      await adminService.updateUser(userId, { ...officer, status: "Inactive" } as User);
      showSuccess("Field officer status updated successfully");
      loadFieldOfficers();
    } catch (error) {
      alert("Failed to update officer status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingOfficer) {
        await adminService.updateUser(editingOfficer.userId!, formData as User);
        showSuccess("Field officer updated successfully");
      } else {
        await adminService.createUser({
          ...formData,
          role: "FieldOfficer",
        } as User);
        showSuccess("Field officer added successfully");
      }
      setShowModal(false);
      loadFieldOfficers();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Operation failed");
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredOfficers.length / itemsPerPage);
  const paginatedOfficers = filteredOfficers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-orange-100 text-orange-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6">
        <h1 className="text-2xl font-bold">Manage Field Officers</h1>
        <p className="text-gray-300 mt-1">Add and maintain field officer profiles</p>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name, badge ID or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <button
            onClick={() => handleAddOrEdit()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium flex items-center gap-2"
          >
            <span>+</span> Add Field Officer
          </button>
        </div>

        {/* Filters */}
      {/* <div className="mt-4 flex gap-3">
        <button
          onClick={() => setStatusFilter("All")}
          className={`px-4 py-2 rounded-lg ${
            statusFilter === "All" ? "bg-gray-600" : "bg-gray-700"
          } hover:bg-gray-600`}
        >
          Status: All
        </button>
        <button
          onClick={() => setAreaFilter("All")}
          className={`px-4 py-2 rounded-lg ${
            areaFilter === "All" ? "bg-gray-600" : "bg-gray-700"
          } hover:bg-gray-600`}
        >
          Area: All
        </button>
      </div> */}
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <span>✓ Success: {successMessage}</span>
        </div>
      )}

      {/* Table */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-gray-500">Loading field officers...</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-700">Civil Name ID</th>
                      <th className="text-left p-4 font-medium text-gray-700">Service Number / Badge ID</th>
                      <th className="text-left p-4 font-medium text-gray-700">Rank</th>
                      <th className="text-left p-4 font-medium text-gray-700">Area</th>
                      <th className="text-left p-4 font-medium text-gray-700">Contact Number</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOfficers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center p-12 text-gray-500">
                          No field officers found
                        </td>
                      </tr>
                    ) : (
                      paginatedOfficers.map((officer) => (
                        <tr key={officer.userId} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                                {officer.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{officer.name}</div>
                                <div className="text-sm text-gray-500">OFCR-00{officer.userId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">{officer.badgeNo || "N/A"}</td>
                          <td className="p-4">{officer.rank || "Officer"}</td>
                          <td className="p-4">{officer.assignedArea || "Unassigned"}</td>
                          <td className="p-4">{officer.contactNumber || "N/A"}</td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                officer.status || "Active"
                              )}`}
                            >
                              {officer.status || "Active"}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleAddOrEdit(officer)}
                              className="text-blue-600 hover:underline mr-4"
                            >
                              View/Edit
                            </button>
                            <button
                              onClick={() => handleDeactivate(officer.userId!)}
                              className="text-red-600 hover:underline"
                            >
                              Deactivate
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredOfficers.length)} of{" "}
                    {filteredOfficers.length} records
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === i + 1
                            ? "bg-blue-600 text-white"
                            : "border hover:bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal - Add/Edit Field Officer */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingOfficer ? "Edit Field Officer" : "Add New Field Officer"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">NIC / ID Number</label>
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Rank</label>
                  <select
                    name="rank"
                    value={formData.rank || "Officer"}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    {ranks.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Assigned Area *</label>
                  <select
                    name="assignedArea"
                    value={formData.assignedArea || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="">Select Area</option>
                    {areas.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Service Number / Badge ID *</label>
                  <input
                    type="text"
                    name="badgeNo"
                    value={formData.badgeNo || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Number *</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber || ""}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Official Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status || "Active"}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {!editingOfficer && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Password *</label>
                    <input
                      type="password"
                      name="passwordHash"
                      value={formData.passwordHash || ""}
                      onChange={handleInputChange}
                      required={!editingOfficer}
                      className="w-full border rounded-lg px-4 py-2"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingOfficer ? "Save Changes" : "Add Officer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageProfiles;