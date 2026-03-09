import api from "../services/api";
import type {
  crimeLocationType,
  crimeReportType,
  evidenceType,
} from "../types/crime";

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
    const res = await api.get<crimeReportType[]>("/crime-reports", {
      timeout: 30000,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching crime reports:", error);
    throw error;
  }
}

export async function getCrimeLocations(): Promise<crimeLocationType[]> {
  try {
    const res = await api.get<crimeLocationType[]>("/crime-reports/map");
    return res.data;
  } catch (err) {
    console.error("Error fetching crime locations:", err);
    throw err;
  }
}

export async function uploadEvidence(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/crime-reports/upload-evidence", formData, {
      timeout: 60000, // 60s for large evidence files
    });
    return res.data;
  } catch (err) {
    console.error("Error uploading evidence:", err);
    throw err;
  }
}

export async function downloadEvidence(id: number): Promise<evidenceType[]> {
  try {
    const res = await api.get<evidenceType[]>(`/crime-reports/download/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error downloading evidence:", err);
    throw err;
  }
}
