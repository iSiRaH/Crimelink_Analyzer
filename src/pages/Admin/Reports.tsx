import { useState } from "react";
import {
  FaFileAlt,
  FaChartLine,
  FaClipboardList,
  FaCalendarAlt,
  FaServer,
  FaDownload,
} from "react-icons/fa";

/* ───────────── types ───────────── */
interface ReportDef {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

const REPORT_TYPES: ReportDef[] = [
  { id: "users", label: "User Activity Report", desc: "Track user login/logout activities", icon: <FaChartLine /> },
  { id: "audit", label: "Audit Logs Report", desc: "Comprehensive audit trail", icon: <FaClipboardList /> },
  { id: "duty", label: "Duty Schedule Report", desc: "Officer duty assignments", icon: <FaCalendarAlt /> },
  { id: "system", label: "System Usage Report", desc: "Overall system metrics", icon: <FaServer /> },
];

/* ═══════════════ main component ═══════════════ */
function Reports() {
  const [reportType, setReportType] = useState("users");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!dateFrom || !dateTo) return;
    setGenerating(true);
    // TODO: Implement report generation logic with actual API call
    setTimeout(() => {
      setGenerating(false);
    }, 1500);
  };

  const inputCls =
    "w-full p-3 rounded-lg border border-dark-border bg-dark-bg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50";
  const selectCls =
    "w-full p-3 rounded-lg border border-dark-border bg-dark-bg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-primary/50 cursor-pointer";

  return (
    <div className="w-full min-h-screen bg-dark-bg text-white font-[Inter,system-ui,sans-serif] p-6 lg:p-8">
      {/* Header */}
      <h1 className="text-2xl lg:text-3xl font-bold mb-8">Reports</h1>

      {/* Generate Report card */}
      <div className="bg-dark-panel rounded-2xl border border-dark-border p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-primary/15 flex items-center justify-center text-purple-primary">
            <FaFileAlt size={18} />
          </div>
          <h2 className="text-lg font-semibold">Generate Report</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="rp-type" className="block text-sm font-medium text-gray-400 mb-1.5">
              Report Type
            </label>
            <select
              id="rp-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={selectCls}
            >
              {REPORT_TYPES.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rp-from" className="block text-sm font-medium text-gray-400 mb-1.5">
              From Date
            </label>
            <input
              id="rp-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="rp-to" className="block text-sm font-medium text-gray-400 mb-1.5">
              To Date
            </label>
            <input
              id="rp-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !dateFrom || !dateTo}
          className="flex items-center gap-2 bg-purple-primary hover:bg-purple-hover text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaDownload size={14} />
          {generating ? "Generating…" : "Generate Report"}
        </button>
      </div>

      {/* Available Reports catalog */}
      <div className="bg-dark-panel rounded-2xl border border-dark-border p-6">
        <h2 className="text-lg font-semibold mb-5">Available Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {REPORT_TYPES.map((rt) => (
            <button
              key={rt.id}
              onClick={() => setReportType(rt.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${
                reportType === rt.id
                  ? "border-purple-primary/50 bg-purple-primary/10"
                  : "border-dark-border bg-dark-bg hover:border-purple-primary/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  reportType === rt.id ? "bg-purple-primary/20 text-purple-primary" : "bg-dark-border text-gray-400"
                }`}
              >
                {rt.icon}
              </div>
              <div>
                <p className={`font-semibold text-sm ${reportType === rt.id ? "text-purple-primary" : "text-white"}`}>
                  {rt.label}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{rt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;
