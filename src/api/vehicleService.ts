import api from "../services/api";

export async function downloadPlateRegistryReportPdf(
  fromDate: string,
  toDate: string
): Promise<Blob> {
  const response = await api.get<Blob>("/vehicles/report/pdf", {
    params: {
      start: fromDate,
      end: toDate,
    },
    responseType: "blob", 
  });

  return response.data;
}