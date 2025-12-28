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

export async function getCrimeReports(): Promise<crimeReportType[]> {
  try {
    const res = await api.get<crimeReportType[]>("/crime-reports");
    return res.data;
  } catch (error) {
    console.error("Error fetching crime reports:", error);
    throw error;
  }
}
