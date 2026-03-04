import { useEffect, useState } from "react";
import {
  downloadEvidence,
  getCrimeReports,
} from "../../api/crimeReportService";
import type { crimeReportType } from "../../types/crime";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ViewCrimeReports() {
  const [reports, setReports] = useState<crimeReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
      <div className="bg-slate-500 w-full h-full p-5">
        <h1 className="font-semibold text-3xl text-white mb-5">
          View Crime Reports
        </h1>
        <NavLink to={"/oic/report-crimes"}>
          <button className="bg-blue-500 text-white py-2 px-5 rounded mt-5">
            Back
          </button>
        </NavLink>
        <table className="table-auto w-11/12 bg-white border shadow-lg">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="p-3 border">Crime ID</th>
              <th className="p-3 border">Crime Type</th>
              <th className="p-3 border">Crime Date</th>
              <th className="p-3 border">Crime Time</th>
              <th className="p-3 border">Crime Location</th>
              <th className="p-3 border">Crime Description</th>
              <th className="p-3 border">Evidence</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 border" colSpan={7}>
                  Loading...
                </td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td className="p-3 border" colSpan={7}>
                  No crime reports found.
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr
                  key={
                    report.reportId ??
                    `${report.dateReported}-${report.timeReported}-${report.latitude}-${report.longitude}`
                  }
                >
                  <td className="p-3 border">{report.reportId}</td>
                  <td className="p-3 border">{report.crimeType}</td>
                  <td className="p-3 border">{report.dateReported}</td>
                  <td className="p-3 border">{report.timeReported}</td>
                  <td className="p-3 border">{`${report.latitude}, ${report.longitude}`}</td>
                  <td className="p-3 border">{report.description}</td>
                  <td className="p-3 border">
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
                      className="text-blue-500 hover:underline"
                    >
                      Download All
                    </a>
                  </td>
                </tr>
              ))
            )}
            {error && (
              <tr>
                <td className="text-red-500 text-xl p-5 border" colSpan={7}>
                  {error}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ViewCrimeReports;
