import { useEffect, useMemo, useState } from "react";
import {
  downloadEvidence,
  getCrimeReports,
} from "../../api/crimeReportService";
import type { crimeReportType } from "../../types/crime";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";

function ViewCrimeReports() {
  type SortKey =
    | "reportId"
    | "crimeType"
    | "dateReported"
    | "timeReported"
    | "crimeLocation"
    | "description";

  const [reports, setReports] = useState<crimeReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>(null);
  const navigate = useNavigate();

  const requestSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortValue = (report: crimeReportType, key: SortKey) => {
    switch (key) {
      case "reportId":
        return report.reportId ?? -1;
      case "crimeType":
        return report.crimeType ?? "";
      case "dateReported": {
        const ts = Date.parse(report.dateReported ?? "");
        return Number.isNaN(ts) ? (report.dateReported ?? "") : ts;
      }
      case "timeReported": {
        const [h, m, s] = (report.timeReported ?? "").split(":").map(Number);
        if ([h, m].every((n) => Number.isFinite(n))) {
          return h * 3600 + m * 60 + (Number.isFinite(s) ? s : 0);
        }
        return report.timeReported ?? "";
      }
      case "crimeLocation":
        return `${report.latitude ?? ""}, ${report.longitude ?? ""}`;
      case "description":
        return report.description ?? "";
      default:
        return "";
    }
  };

  const sortedReports = useMemo(() => {
    if (!sortConfig) return reports;

    const sorted = [...reports].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      let compareResult = 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        compareResult = aValue - bValue;
      } else {
        compareResult = String(aValue).localeCompare(
          String(bValue),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          },
        );
      }

      return sortConfig.direction === "asc" ? compareResult : -compareResult;
    });

    return sorted;
  }, [reports, sortConfig]);

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return "";
    return sortConfig.direction === "asc" ? " ^" : " v";
  };

  useEffect(() => {
    let isActive = true;

    const fetchReports = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getCrimeReports();
        if (!isActive) return;

        if (Array.isArray(data)) {
          setReports(data);
          setError(null);
        } else {
          setReports([]);
          setError("Invalid response received for crime reports");
        }
      } catch (error: unknown) {
        if (!isActive) return;

        console.error(error);

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const code = error.code;

          if (status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setError("Session expired. Please login again.");
            navigate("/login", { replace: true });
            return;
          }

          if (status === 403) {
            setError("You do not have permission to view crime reports.");
            return;
          }

          if (code === "ECONNABORTED") {
            setError("Request timed out while loading crime reports.");
            return;
          }

          if (code === "ERR_NETWORK") {
            setError(
              "Cannot reach backend server. Please check if backend is running.",
            );
            return;
          }

          setError(
            `Failed to fetch crime reports (HTTP ${status ?? "unknown"})`,
          );
          return;
        }

        setError("Failed to fetch crime reports");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchReports();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const handleDownload = async (reportId: number) => {
    try {
      console.log("Initiating evidence download for report ID:", reportId);
      const evidences = await downloadEvidence(reportId);

      if (!Array.isArray(evidences) || evidences.length === 0) {
        setError("No evidence files found for this report.");
        return;
      }

      const evidenceUrls = evidences
        .map((evidence) => evidence.downloadUrl)
        .filter(
          (url): url is string =>
            typeof url === "string" && url.trim().length > 0,
        );

      if (evidenceUrls.length === 0) {
        setError("No valid evidence download URLs received.");
        return;
      }

      evidenceUrls.forEach((url, index) => {
        setTimeout(() => {
          window.open(url, "_blank", "noopener,noreferrer");
        }, index * 150);
      });
    } catch (err) {
      console.error("Evidence download failed:", err);
      setError("Failed to download evidence.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-dark-bg p-3 text-white">
        <div className="mb-4">
          <NavLink to="/oic/report-crimes">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm font-medium">
              <ArrowLeft size={16} />
              Back
            </button>
          </NavLink>
        </div>
        <div className="mb-6 flex w-full flex-col justify-between gap-4 rounded-xl bg-dark-panel p-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-semibold">View Crime Reports</h1>
        </div>

        <div className="w-full rounded-xl bg-dark-panel p-6 sm:px-5">
          <div className="w-full overflow-auto rounded-xl border border-dark-border bg-dark-bg">
            <table className="min-w-[980px] w-full border-separate border-spacing-0 text-sm text-gray-200">
              <thead className="sticky top-0 z-10 bg-[#222a40]">
                <tr>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    <button
                      type="button"
                      onClick={() => requestSort("reportId")}
                      className="cursor-pointer select-none"
                    >
                      Crime ID{getSortIndicator("reportId")}
                    </button>
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    <button
                      type="button"
                      onClick={() => requestSort("crimeType")}
                      className="cursor-pointer select-none"
                    >
                      Crime Type{getSortIndicator("crimeType")}
                    </button>
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    <button
                      type="button"
                      onClick={() => requestSort("dateReported")}
                      className="cursor-pointer select-none"
                    >
                      Crime Date{getSortIndicator("dateReported")}
                    </button>
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    <button
                      type="button"
                      onClick={() => requestSort("timeReported")}
                      className="cursor-pointer select-none"
                    >
                      Crime Time{getSortIndicator("timeReported")}
                    </button>
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    <button
                      type="button"
                      onClick={() => requestSort("crimeLocation")}
                      className="cursor-pointer select-none"
                    >
                      Crime Location{getSortIndicator("crimeLocation")}
                    </button>
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    <button
                      type="button"
                      onClick={() => requestSort("description")}
                      className="cursor-pointer select-none"
                    >
                      Crime Description{getSortIndicator("description")}
                    </button>
                  </th>
                  <th className="border-b border-dark-border px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-300">
                    Evidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-gray-400"
                      colSpan={7}
                    >
                      Loading...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td
                      className="px-3 py-6 text-center text-gray-400"
                      colSpan={7}
                    >
                      No crime reports found.
                    </td>
                  </tr>
                ) : (
                  sortedReports.map((report) => (
                    <tr
                      key={
                        report.reportId ??
                        `${report.dateReported}-${report.timeReported}-${report.latitude}-${report.longitude}`
                      }
                      className="transition-colors even:bg-white/[0.02] hover:bg-white/[0.06]"
                    >
                      <td className="border-b border-dark-border px-3 py-2.5 text-white">
                        {report.reportId}
                      </td>
                      <td className="border-b border-dark-border px-3 py-2.5">
                        {report.crimeType}
                      </td>
                      <td className="border-b border-dark-border px-3 py-2.5">
                        {report.dateReported}
                      </td>
                      <td className="border-b border-dark-border px-3 py-2.5">
                        {report.timeReported}
                      </td>
                      <td className="border-b border-dark-border px-3 py-2.5 text-gray-300">
                        {`${report.latitude}, ${report.longitude}`}
                      </td>
                      <td className="border-b border-dark-border px-3 py-2.5 text-gray-300">
                        {report.description}
                      </td>
                      <td className="border-b border-dark-border px-3 py-2.5">
                        <a
                          onClick={(e) => {
                            e.preventDefault();
                            if (report.reportId) {
                              handleDownload(report.reportId);
                            }
                          }}
                          target="_blank"
                          rel="noopener noreferrer"
                          href="#"
                          className="font-medium text-green-400 transition-colors hover:text-green-300 hover:underline"
                        >
                          Download All
                        </a>
                      </td>
                    </tr>
                  ))
                )}
                {error && (
                  <tr>
                    <td
                      className="border-b border-dark-border bg-red-950/50 px-3 py-4 text-center text-sm text-red-300"
                      colSpan={7}
                    >
                      {error}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewCrimeReports;
