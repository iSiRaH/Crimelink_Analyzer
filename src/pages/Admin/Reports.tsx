import { useState } from "react";
import {
  getUserActivityReport,
  getAuditReport,
  exportToCSV,
  printReport,
  type ReportData,
} from "../../api/reportService";

function Reports() {
  const [reportType, setReportType] = useState("users");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      let data: ReportData;

      switch (reportType) {
        case "users":
          data = await getUserActivityReport(dateFrom, dateTo);
          break;
        case "audit":
          data = await getAuditReport(dateFrom, dateTo);
          break;
        default:
          throw new Error("Invalid report type");
      }

      setReportData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to generate report");
      console.error("Error generating report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (reportData) {
      exportToCSV(reportData);
    }
  };

  const handlePrint = () => {
    printReport();
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

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>

          {reportData && (
            <>
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                Print Report
              </button>
            </>
          )}
        </div>
      </div>

      {reportData && (
        <div className="mt-6 bg-white border rounded-lg p-6 shadow print:shadow-none">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{reportData.reportType}</h2>
            <p className="text-sm text-gray-600">
              Generated at: {new Date(reportData.generatedAt).toLocaleString()}
            </p>
            {reportData.dateFrom && reportData.dateTo && (
              <p className="text-sm text-gray-600">
                Period: {reportData.dateFrom} to {reportData.dateTo}
              </p>
            )}
          </div>

          {/* Summary Section */}
          {reportData.summary && Object.keys(reportData.summary).length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Table */}
          {reportData.data && reportData.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(reportData.data[0]).map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.replace(/([A-Z])/g, " $1").trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.values(row).map((value, cellIdx) => (
                        <td
                          key={cellIdx}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {value !== null && value !== undefined
                            ? typeof value === "boolean"
                              ? value
                                ? "Yes"
                                : "No"
                              : typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)
                            : "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportData.data && reportData.data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No data available for the selected criteria
            </div>
          )}
        </div>
      )}

      <div className="mt-6 bg-white border rounded-lg p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
        <ul className="space-y-2">
          <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">User Activity Report</span>
            <span className="text-sm text-gray-600">
              Track user login activities and status
            </span>
          </li>
          <li className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">Audit Logs Report</span>
            <span className="text-sm text-gray-600">
              Comprehensive audit trail of all system activities
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Reports;