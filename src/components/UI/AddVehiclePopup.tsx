// IMPLEMENT component
const AddVehiclePopup = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Vehicle</h2>
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
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
  );
};

export default AddVehiclePopup;
