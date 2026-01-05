import { useEffect, useState } from "react";
import { getCrimeReports } from "../../api/crimeReportService";
import type { crimeReportType } from "../../types/crime";
import { NavLink } from "react-router-dom";

function ViewCrimeReports() {
  const [reports, setReports] = useState<crimeReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getCrimeReports();
        // console.log(data);
        setReports(data);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch crime reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <>
      <div className="bg-slate-500 w-full h-full p-5">
        <h1 className="font-semibold text-3xl text-white mb-5">
          View Crime Reports
        </h1>
        <table className="table-auto w-11/12 bg-white border shadow-lg">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="p-3 border">Crime ID</th>
              <th className="p-3 border">Crime Type</th>
              <th className="p-3 border">Crime Date</th>
              <th className="p-3 border">Crime Time</th>
              <th className="p-3 border">Crime Location</th>
              <th className="p-3 border">Crime Description</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <p>Loading...</p>
            ) : reports.length === 0 ? (
              <p>No crime reports found.</p>
            ) : (
              reports.map((report) => (
                <tr key={report.reportId}>
                  <td className="p-3 border">{report.reportId}</td>
                  <td className="p-3 border">{report.crimeType}</td>
                  <td className="p-3 border">{report.dateReported}</td>
                  <td className="p-3 border">{report.timeReported}</td>
                  <td className="p-3 border">{`${report.latitude}, ${report.longitude}`}</td>
                  <td className="p-3 border">{report.description}</td>
                </tr>
              ))
            )}
            {error && <p className="text-red-500 text-xl p-5">{error}</p>}
          </tbody>
        </table>
        <NavLink to={"/oic/report-crimes"}>
          <button className="bg-blue-500 text-white py-2 px-5 rounded mt-5">
            Back
          </button>
        </NavLink>
      </div>
    </>
  );
}

export default ViewCrimeReports;
