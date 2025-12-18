import { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import axios  from "axios";
import DropDownMenu from "../../components/UI/DropdownMenu";
import type {Vehicle} from "../../types/vehicle"

const API_BASE_URL = "http://localhost:8080";

function PlateRegistry(){

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [vehicleData, setVehicleData] = useState({
        numberPlate: "",
        ownerName: "",
        vehicleType: "",
        status: "",
        lastUpdate: ""
    });

    useEffect(() =>{
        fetchVehicles();
    },[]);
    
    const fetchVehicles = () =>{
        setLoading(true);
        setError(null);
    
    axios
        .get(`${API_BASE_URL}/api/vehicles`)

        .then((response) => {
            console.log("Vehicles fetched:",response.data);
            setVehicles(response.data);
            setLoading(false)
        })

        .catch((error) => {
            console.error("Error fetching vehicles:", error);
            setError(
                error.response?.data?.message ||
                "Failed to fetch vehicles. Make sure backend is running."
            );
            setLoading(false);
        });
};

    const handleAddVehicle = () =>{

        if(!vehicleData.numberPlate || !vehicleData.ownerName || !vehicleData.vehicleType){
            setError("Please fill in all required fields.");
            return;
        }
        setLoading(true);
        setError(null);

    axios
        .post(`${API_BASE_URL}/api/vehicles`, vehicleData,{
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
                lastUpdate: ""
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

    const handleDeleteVehicle = (id: number) => {
        if (!window.confirm("Are you sure you want to delete this vehicle?")) {
            return;
        }

        axios
            .delete(`${API_BASE_URL}/api/vehicles/${id}`)
            .then(() => {
                console.log("Vehicle deleted:", id);
                setVehicles(vehicles.filter(v => v.id !== id));
                alert("Vehicle deleted successfully!");
            })
            .catch((error) => {
                console.error("Error deleting vehicle:", error);
                alert("Failed to delete vehicle");
            });
    };

  return(
    <div className="bg-slate-500 w-full h-full p-5">
        <div className="bg-slate-800 p-5 rounded-lg">
            <h1 className="font-semibold text-3xl text-white">Plate Registry</h1>

            <div className="flex flex-row gap-3 mt-5 items-center">
                <div className="relative w-2/5">
                    <IoSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 size={18}"/>
                    <input
                        type="text"
                        placeholder="Search by plate or owner name"
                        className="w-full py-2 pl-9 pr-4 rounded-md"
                    />
                </div>
                <DropDownMenu
                    dropdownLabelName="Filter by Status"
                    items={[{itemTitle:"Active"}, {itemTitle:"Inactive"}]}
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    onClick={() => setShowModal(true)}
                    disabled={loading}
                >
                    + Add Vehicle
                </button>
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                    onClick={fetchVehicles}
                    disabled={loading}
                >
                    🔄 Refresh
                </button>
            </div>
        {error && (
            <div className="mt-4 p-3 bg-red-500 text-white rounded-md">
                {error}
                <button onClick={() => setError(null)} className="ml-4 font-bold">✕</button>
            </div>
        )}
        </div>
        <div className="w-full flex justify-center mt-5">
            {loading ?(
                <div className="text-white text-xl">Loading vehicles...</div>
            ) : (
                <table className="w-full bg-white border rounded-lg">
                    <thead>
                        <tr className="bg-slate-700 text-white">
                            <th className="p-3 border">Plate Number</th>
                            <th className="p-3 border">Owner Name</th>
                            <th className="p-3 border">Vehicle Type</th>
                            <th className="p-3 border">Status</th>
                            <th className="p-3 border">Last Update</th>
                            <th className="p-3 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vehicles.length === 0 ?(
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No vehicles found. Click "Add Vehicle" to get started.
                                </td>
                            </tr>
                        ) : (

                            vehicles.map((vehicle) => (
                            <tr key={vehicle.id} className="hover:bg-gray-50">
                                <td className="p-3 border font-semibold text-blue-600">{vehicle.numberPlate}</td>
                                <td className="p-3 border">{vehicle.ownerName}</td>
                                <td className="p-3 border">{vehicle.vehicleType}</td>
                                <td className="p-3 border">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                        vehicle.status === 'Active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                         }`}>
                                            {vehicle.status}
                                    </span>
                                </td>
                                <td className="p-3 border">{vehicle.lastUpdate}</td>
                                <td className="p-3 border text-center">
                                    <button
                                        onClick={() => vehicle.id && handleDeleteVehicle(vehicle.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            )}
        </div>

        {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg w-96">
                    <h2 className="text-2xl font-bold mb-4">Add New Vehicle</h2>

                    <div className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Number Plate <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={vehicleData.numberPlate}
                                onChange={(e) => setVehicleData({...vehicleData, numberPlate: e.target.value})}
                                placeholder="e.g., ABC-1234"
                                className="w-full p-2 border rounded-md"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Owner Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={vehicleData.ownerName}
                                onChange={(e) => setVehicleData({...vehicleData, ownerName: e.target.value})}
                                placeholder="e.g., John Doe"
                                className="w-full p-2 border rounded-md"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Vehicle type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={vehicleData.vehicleType}
                                onChange={(e) => setVehicleData({...vehicleData, vehicleType: e.target.value})}
                                className="w-full p-2 border rounded-md"
                                
                            >
                                <option value="">Select Vehicle Type</option>
                                <option value="Car">Car</option>
                                <option value="Van">Van</option>
                                <option value="Truck">Truck</option>
                                <option value="Motorcycle">Motorcycle</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Status
                            </label>
                            <select
                                value={vehicleData.status}
                                onChange={(e) => setVehicleData({...vehicleData, status: e.target.value})}
                                className="w-full p-2 border rounded-md"
                                
                            >
                                <option value="">Select Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Last Update
                            </label>
                            <input
                                type="date"
                                value={vehicleData.lastUpdate}
                                onChange={(e) => setVehicleData({...vehicleData, lastUpdate: e.target.value})}
                                className="w-full p-2 border rounded-md"
                            />  
                        </div>
                    </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md flex-1"
                                onClick={handleAddVehicle}
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save Vehicle"}
                            </button>

                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-md flex-1"
                                onClick={() => {
                                    setShowModal(false);
                                    setError(null);
                                    setVehicleData({
                                        numberPlate: "",
                                        ownerName: "",
                                        vehicleType: "",
                                        status: "",
                                        lastUpdate: ""
                                    });
                                }}
                                
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