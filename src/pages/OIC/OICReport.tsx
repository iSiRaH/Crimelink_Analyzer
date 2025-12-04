import {useState} from "react";
import { downloadDutyScheduleReportPdf } from "../../api/dutyService";


function OICReport(){

    const [reportType, setReportType] = useState("duty");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!dateFrom || !dateTo) {
            alert("Please select both From Date and To Date");
            return;
        }

        if (dateFrom > dateTo) {
            alert("From Date cannot be after To Date");
            return;
        }

       // For now we only implement Duty Schedule PDF
        if (reportType === "duty") {
            try {
                setLoading(true);
                // 1) Call API to get PDF as Blob
                const pdfBlob = await downloadDutyScheduleReportPdf(dateFrom, dateTo);

                // 2) Create temporary URL
                const url = window.URL.createObjectURL(
                new Blob([pdfBlob], { type: "application/pdf" })
                );

                // 3) Create a hidden <a> and click it to trigger download
                const link = document.createElement("a");
                link.href = url;
                link.download = `duty-schedule-${dateFrom}-to-${dateTo}.pdf`;
                document.body.appendChild(link);
                link.click();
                alert("Duty Schedule PDF report generated successfully.");

                 // 4) Cleanup
                link.remove();
                window.URL.revokeObjectURL(url);
                } catch (err) {
                console.error("Failed to generate duty schedule PDF", err);
                alert("Failed to generate duty schedule report. Please try again.");
                } finally {
                setLoading(false);
                }   
        } else {
                // later you can implement weapon/plate PDFs here
            alert(
                `Report type "${reportType}" PDF download not implemented yet. Currently only Duty Schedule is supported.`
            );
        }
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
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                >
                    {loading ? "Generating..." : "Generate Report"}
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