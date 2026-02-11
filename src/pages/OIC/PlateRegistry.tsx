import { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import type { Vehicle } from "../../types/vehicle";

const API_BASE_URL = "http://localhost:8080";

function PlateRegistry() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("All");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleData, setVehicleData] = useState({
    numberPlate: "",
    ownerName: "",
    vehicleType: "",
    status: "",
    lostDate: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = () => {
    setLoading(true);
    setError(null);

    axios
      .get(`${API_BASE_URL}/api/vehicles`)
      .then((response) => {
        console.log("Vehicles fetched:", response.data);
        setVehicles(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching vehicles:", error);
        setError(
          error.response?.data?.message ||
            "Failed to fetch vehicles. Make sure backend is running.",
        );
        setLoading(false);
      });
  };

  const filteredAndSortedVehicles = vehicles
    .filter((vehicle) => {
      const matchesSearch =
        vehicle.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.ownerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || vehicle.status === statusFilter;

      const matchesVehicleType =
        vehicleTypeFilter === "All" ||
        vehicle.vehicleType === vehicleTypeFilter;

      const matchesDate = !selectedDate || vehicle.lostDate === selectedDate;

      return (
        matchesSearch && matchesStatus && matchesVehicleType && matchesDate
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.lostDate).getTime();
      const dateB = new Date(b.lostDate).getTime();
      return dateB - dateA;
    });

  const handleAddVehicle = () => {
    if (
      !vehicleData.numberPlate ||
      !vehicleData.ownerName ||
      !vehicleData.vehicleType
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);

    axios
      .post(`${API_BASE_URL}/api/vehicles`, vehicleData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        console.log("Vehicle added:", response.data);
        setVehicles([...vehicles, response.data]);
        setShowModal(false);
        setVehicleData({
          numberPlate: "",
          ownerName: "",
          vehicleType: "",
          status: "",
          lostDate: "",
        });
        setLoading(false);
        alert("Vehicle added successfully!");
      })
      .catch((error) => {
        console.error("Error adding vehicle:", error);
        setError(error.response?.data?.message || "Failed to add vehicle");
        setLoading(false);
      });
  };

  const handleUpdateVehicle = () => {
    if (!editingVehicle || !editingVehicle.id) {
      setError("No vehicle selected for update.");
      return;
    }
    setLoading(true);
    setError(null);

    axios
      .put(
        `${API_BASE_URL}/api/vehicles/${editingVehicle.id}`,
        editingVehicle,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        console.log("Vehicle updated:", response.data);
        setVehicles(
          vehicles.map((v) => (v.id === editingVehicle.id ? response.data : v)),
        );
        setShowEditModal(false);
        setEditingVehicle(null);
        setLoading(false);
        alert("Vehicle updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating vehicle:", error);
        setError(error.response?.data?.message || "Failed to update vehicle");
        setLoading(false);
      });
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle({ ...vehicle });
    setShowEditModal(true);
  };

  const handleDeleteVehicle = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }

    axios
      .delete(`${API_BASE_URL}/api/vehicles/${id}`)
      .then(() => {
        console.log("Vehicle deleted:", id);
        setVehicles(vehicles.filter((v) => v.id !== id));
        alert("Vehicle deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete vehicle");
      });
  };

  return (
    <div className="w-full min-h-screen bg-dark-bg flex-col font-[Inter,system-ui,sans-serif] text-white pt-4 sm:pt-5 lg:pt-6">
      <div className="bg-dark-panel rounded-[22px] sm:rounded-[28px] lg:rounded-[40px] mx-3 sm:mx-5 lg:mx-6 mb-4 sm:mb-5 lg:mb-7 p-4 sm:p-6 lg:px-10 lg:py-8 flex-1">
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-5 lg:mb-6">
          Plate Registry
        </h1>

        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-5 flex-wrap sm:flex-row items-stretch sm:items-center">
          <div className="relative w-full sm:w-[280px] md:w-[320px]">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by plate or owner name"
              className="w-full h-10 sm:h-11 rounded-xl border-none pl-11 pr-4 text-sm bg-white text-dark-bg outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 sm:h-11 w-full sm:w-auto px-4 sm:px-5 rounded-xl border border-dark-border bg-white text-dark-bg text-sm font-semibold cursor-pointer flex items-center gap-2 min-w-[120px] justify-center hover:bg-gray-100 transition-colors"
          >
            <option value="All">All Status</option>
            <option value="Stolen">Stolen</option>
            <option value="Found">Found</option>
          </select>

          <select
            value={vehicleTypeFilter}
            onChange={(e) => setVehicleTypeFilter(e.target.value)}
            className="h-10 sm:h-11 w-full sm:w-auto px-4 sm:px-5 rounded-xl border border-dark-border bg-white text-dark-bg text-sm font-semibold cursor-pointer flex items-center gap-2 min-w-[120px] justify-center hover:bg-gray-100 transition-colors"
          >
            <option value="All">All Vehicle Types</option>
            <option value="Car">Car</option>
            <option value="Van">Van</option>
            <option value="Lorry">Lorry</option>
            <option value="Motorcycle">Motorcycle</option>
            <option value="Other">Other</option>
          </select>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-white text-sm font-medium">Lost Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 sm:h-11 w-full sm:w-auto px-4 rounded-xl border border-dark-border bg-white text-dark-bg text-sm cursor-pointer min-w-[140px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4 sm:mb-5">
          <button
            className="h-10 sm:h-11 px-5 sm:px-6 rounded-lg border-none text-sm font-semibold cursor-pointer flex items-center gap-2 transition-opacity hover:opacity-90 bg-green-500 text-white"
            onClick={() => setShowModal(true)}
            disabled={loading}
          >
            + Add Vehicle
          </button>

          <button
            className="h-10 sm:h-11 px-5 sm:px-6 rounded-lg border-none text-sm font-semibold cursor-pointer flex items-center gap-2 transition-opacity hover:opacity-90 bg-blue-500 text-white"
            onClick={fetchVehicles}
            disabled={loading}
          >
            ↻ Refresh
          </button>

          <button
            className="h-10 sm:h-11 px-5 sm:px-6 rounded-lg border-none text-sm font-semibold cursor-pointer flex items-center gap-2 transition-opacity hover:opacity-90 bg-red-500 text-white sm:ml-auto"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
              setVehicleTypeFilter("All");
              setSelectedDate("");
            }}
          >
            Clear All Filters
          </button>
        </div>

        {error && (
          <div className="bg-red-500 rounded-lg px-5 py-3 flex items-center justify-between mb-5">
            <span className="text-white text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="bg-transparent border-none text-white text-xl cursor-pointer px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="w-full flex justify-center mt-4 sm:mt-5">
        {loading ? (
          <div className="text-white text-base sm:text-xl bg-slate-800 p-6 sm:p-8 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span>Loading vehicles...</span>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto px-3 sm:px-5 pb-2">
            <table className="w-full bg-white border border-collapse rounded-lg shadow-lg text-sm sm:text-base">
              <thead>
                <tr className="bg-slate-700 text-white border-b-2 border-dark-border">
                  <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-sm font-semibold whitespace-nowrap">
                    Plate Number
                  </th>
                  <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-sm font-semibold whitespace-nowrap">
                    Owner Name
                  </th>
                  <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-sm font-semibold whitespace-nowrap">
                    Vehicle Type
                  </th>
                  <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-sm font-semibold whitespace-nowrap">
                    Status
                  </th>
                  <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-sm font-semibold whitespace-nowrap">
                    Lost Date
                  </th>
                  <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-sm font-semibold whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="text-black">
                {filteredAndSortedVehicles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 sm:p-8 text-center text-gray-500"
                    >
                      No vehicles found. Click "Add Vehicle" to get started.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedVehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-b border-dark-border transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="p-3 sm:p-4 border font-semibold text-blue-600">
                        {vehicle.numberPlate}
                      </td>
                      <td className="p-3 sm:p-4 border">{vehicle.ownerName}</td>
                      <td className="p-3 sm:p-4 border">
                        {vehicle.vehicleType}
                      </td>
                      <td className="p-3 sm:p-4 border">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${
                            vehicle.status === "Found"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-gray-800"
                          }`}
                        >
                          {vehicle.status}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 border">{vehicle.lostDate}</td>
                      <td className="p-3 sm:p-4 border text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditClick(vehicle)}
                            className="px-3 sm:px-4 py-1.5 bg-blue-500 text-white border-none rounded-md text-[12px] sm:text-[13px] font-medium cursor-pointer transition-colors hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              vehicle.id && handleDeleteVehicle(vehicle.id)
                            }
                            className="px-3 sm:px-4 py-1.5 bg-red-500 text-white border-none rounded-md text-[12px] sm:text-[13px] font-medium cursor-pointer transition-colors hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 sm:p-6">
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black">
              Add New Vehicle
            </h2>
            {error && (
              <div className="mb-4 p-2.5 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">
                  Number Plate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleData.numberPlate}
                  onChange={(e) =>
                    setVehicleData({
                      ...vehicleData,
                      numberPlate: e.target.value,
                    })
                  }
                  placeholder="e.g., ABC-1234"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleData.ownerName}
                  onChange={(e) =>
                    setVehicleData({
                      ...vehicleData,
                      ownerName: e.target.value,
                    })
                  }
                  placeholder="e.g., John Doe"
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Vehicle type <span className="text-red-500">*</span>
                </label>
                <select
                  value={vehicleData.vehicleType}
                  onChange={(e) =>
                    setVehicleData({
                      ...vehicleData,
                      vehicleType: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Car">Car</option>
                  <option value="Van">Van</option>
                  <option value="Lorry">Lorry</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Status
                </label>
                <select
                  value={vehicleData.status}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, status: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select Status</option>
                  <option value="Stolen">Stolen</option>
                  <option value="Found">Found</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Lost Date
                </label>
                <input
                  type="date"
                  value={vehicleData.lostDate}
                  onChange={(e) =>
                    setVehicleData({ ...vehicleData, lostDate: e.target.value })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex-1 disabled:bg-gray-400 transition-colors font-medium"
                onClick={handleAddVehicle}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Vehicle"}
              </button>

              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex-1 transition-colors font-medium"
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                  setVehicleData({
                    numberPlate: "",
                    ownerName: "",
                    vehicleType: "",
                    status: "",
                    lostDate: "",
                  });
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingVehicle && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 sm:p-6">
          <div className="bg-white p-5 sm:p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-800">
              Edit Vehicle
            </h2>
            {error && (
              <div className="mb-4 p-2.5 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number Plate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingVehicle.numberPlate}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      numberPlate: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingVehicle.ownerName}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      ownerName: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingVehicle.vehicleType}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      vehicleType: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  disabled={loading}
                >
                  <option value="">Select Type</option>
                  <option value="Car">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Van">Van</option>
                  <option value="Lorry">Lorry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingVehicle.status}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      status: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  disabled={loading}
                >
                  <option value="">Select Status</option>
                  <option value="Stolen">Stolen</option>
                  <option value="Found">Found</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lost Date
                </label>
                <input
                  type="date"
                  value={editingVehicle.lostDate}
                  onChange={(e) =>
                    setEditingVehicle({
                      ...editingVehicle,
                      lostDate: e.target.value,
                    })
                  }
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex-1 disabled:bg-gray-400"
                onClick={handleUpdateVehicle}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Vehicle"}
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex-1"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingVehicle(null);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlateRegistry;
