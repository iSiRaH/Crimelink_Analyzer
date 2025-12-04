import {useState} from "react";

function OICReport(){

    const [reportType, setReportType] = useState("duty");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const handleGenerate = () => {
        alert(`Generating ${reportType} report from ${dateFrom} to ${dateTo}`);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">OIC Reports</h1>

            <div className="bg-white border rounded-lg p-6 shadow">
                <h2 className="text xl font-semibold mb-4">Generate OIC Report</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">Report Type</label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={reportType}
                            onChange={(e)=> setReportType(e.target.value)}
                        >
                            <option value="duty">Duty Schedule Report</option>
                            <option value="weapon">Weapon Handover Report</option>
                            <option value="plate">Plate Registry Report</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">From Date</label>
                        <input
                            type="date"
                            className="w-full border rounded px-3 py-2"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">To Date</label>
                        <input
                            type="date"
                            className="w-full border rounded px-3 py-2"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                </div>
                <button
                    onClick={handleGenerate}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >Generate Report
                </button>
            </div>

            <div className="mt-6 bg-white border rounded-lg p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
                <ul className="space-y-2">
                    <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Duty Schedule Report</span>
                        <span className="text-sm text-gray-600">Track the Police officers duties</span>
                    </li>
                    <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Weapon Handover Report</span>
                        <span className="text-sm text-gray-600">Details of weapon handovers</span>
                    </li>
                    <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span>Plate Registry Report</span>
                        <span className="text-sm text-gray-600">Information on registered plates</span>
                    </li>

                </ul>

            </div>
        </div>
    );
}

export default OICReport;