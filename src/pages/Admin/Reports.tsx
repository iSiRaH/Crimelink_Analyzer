import { useState } from "react";

function Reports() {
  const [reportType, setReportType] = useState("users");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleGenerate = () => {
    alert(`Generating ${reportType} report from ${dateFrom} to ${dateTo}`);
    // TODO: Implement report generation logic
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="bg-white border rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Generate Report</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="users">User Activity Report</option>
              <option value="audit">Audit Logs Report</option>
              <option value="duty">Duty Schedule Report</option>
              <option value="system">System Usage Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Generate Report
        </button>
      </div>

      <div className="mt-6 bg-white border rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
        <ul className="space-y-2">
          <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>User Activity Report</span>
            <span className="text-sm text-gray-600">
              Track user login/logout activities
            </span>
          </li>
          <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>Audit Logs Report</span>
            <span className="text-sm text-gray-600">
              Comprehensive audit trail
            </span>
          </li>
          <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>Duty Schedule Report</span>
            <span className="text-sm text-gray-600">
              Officer duty assignments
            </span>
          </li>
          <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span>System Usage Report</span>
            <span className="text-sm text-gray-600">
              Overall system metrics
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Reports;
