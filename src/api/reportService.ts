// src/api/reportService.ts
import api from "../services/api";

export interface ReportData {
  reportType: string;
  generatedAt: string;
  dateFrom?: string;
  dateTo?: string;
  data: Record<string, unknown>[];
  summary: Record<string, unknown>;
}

/**
 * Get user activity report
 * GET /api/admin/reports/users?dateFrom=2024-01-01&dateTo=2024-12-31
 */
export async function getUserActivityReport(
  dateFrom?: string,
  dateTo?: string
): Promise<ReportData> {
  const res = await api.get("/admin/reports/users", {
    params: { dateFrom, dateTo },
  });
  return res.data;
}

/**
 * Get audit logs report
 * GET /api/admin/reports/audit?dateFrom=2024-01-01&dateTo=2024-12-31
 */
export async function getAuditReport(
  dateFrom?: string,
  dateTo?: string
): Promise<ReportData> {
  const res = await api.get("/admin/reports/audit", {
    params: { dateFrom, dateTo },
  });
  return res.data;
}

/**
 * Get duty schedule report
 * GET /api/admin/reports/duty?dateFrom=2024-01-01&dateTo=2024-12-31
 */
export async function getDutyScheduleReport(
  dateFrom?: string,
  dateTo?: string
): Promise<ReportData> {
  const res = await api.get("/admin/reports/duty", {
    params: { dateFrom, dateTo },
  });
  return res.data;
}

/**
 * Get system usage report
 * GET /api/admin/reports/system?dateFrom=2024-01-01&dateTo=2024-12-31
 */
export async function getSystemUsageReport(
  dateFrom?: string,
  dateTo?: string
): Promise<ReportData> {
  const res = await api.get("/admin/reports/system", {
    params: { dateFrom, dateTo },
  });
  return res.data;
}

/**
 * Get weapon usage report
 * GET /api/admin/reports/weapons?dateFrom=2024-01-01&dateTo=2024-12-31
 */
export async function getWeaponReport(
  dateFrom?: string,
  dateTo?: string
): Promise<ReportData> {
  const res = await api.get("/admin/reports/weapons", {
    params: { dateFrom, dateTo },
  });
  return res.data;
}

/**
 * Export report as CSV
 */
export function exportToCSV(reportData: ReportData): void {
  if (!reportData.data || reportData.data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get all keys from the first row
  const headers = Object.keys(reportData.data[0]);
  
  // Create CSV content
  let csv = headers.join(",") + "\n";
  
  reportData.data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header];
      // Escape commas and quotes
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csv += values.join(",") + "\n";
  });

  // Create download link
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${reportData.reportType.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Print report
 */
export function printReport(): void {
  window.print();
}
