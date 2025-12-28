import api from "../services/api";
import type { crimeReportType } from "../types/crime";

export async function saveCrimeReports(reports: crimeReportType) {
  try {
    const res = await api.post("/crime-reports", reports);
    return res.data;
  } catch (error) {
    console.error("Error saving crime reports:", error);
    throw error;
  }
}
