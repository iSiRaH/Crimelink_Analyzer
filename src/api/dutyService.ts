import api from "../services/api";
import type { DutyStatus } from "../types/duty";
import type { OfficerDutyRow, DutyCreatePayload, OfficerRecommendation, DutyRecommendationRequest } from "../types/duty";

/**
 * GET officer rows for a selected date
 * Backend expected (choose one):
 * 1) GET /api/duty-schedules/officers?date=YYYY-MM-DD
 * 2) GET /api/duty-schedule/officers/{YYYY-MM-DD}
 */
export async function getOfficerRowsByDate(dateStr: string) {
  //  try query-param endpoint first (your current backend style)
  let res;
  try {
    res = await api.get(`/duty-schedules/officers`, {
      params: { date: dateStr },
    });
  } catch (e) {
    //  fallback to path-variable endpoint if above fails
    res = await api.get(`/duty-schedule/officers/${dateStr}`);
  }

  const rawList: any[] = Array.isArray(res.data)
    ? res.data
    : res.data?.rows || res.data?.data || [];

  return rawList.map((r: any) => {
    const officerId =
      r.officerId ??
      r.assignedOfficer ??
      r.assigned_officer ??
      r.officer_id ??
      r.officer?.userId ??
      r.officer?.id ??
      null;

    const officerName =
      r.officerName ??
      r.name ??
      r.officer_name ??
      r.officer?.name ??
      "";
    const timeRange = r.timeRange ?? r.time ?? "";

    
    const datetime = r.datetime
      ? r.datetime
      : r.time
      ? `${dateStr}T${r.time}:00`
      : "";

    return {
      officerId,
      officerName,
      location: r.location ?? "",
      datetime,
      timeRange,
      duration: r.duration ?? 240,
      taskType: r.taskType ?? r.task_type ?? "General",
      status: r.status ?? "OPEN",
      description: r.description ?? "",
    } as OfficerDutyRow;
  });
}
export async function updateDutyStatus(dutyId: number, status: DutyStatus) {
  const res = await api.patch(`/duty-schedules/${dutyId}/status`, { status });
  return res.data;
}

/**
 * POST save duties (bulk)
 * Backend expected (choose one):
 * 1) POST /api/duty-schedules/bulk   body: DutyCreatePayload[]
 * 2) POST /api/duty-schedules       body: DutyCreatePayload (single)
 */
export async function saveDutiesBulk(payloads: DutyCreatePayload[]) {
  if (!payloads || payloads.length === 0) return [];

  //  try bulk endpoint first
  try {
    const res = await api.post(`/duty-schedules/bulk`, payloads);
    return res.data;
  } catch (bulkErr) {
    //  fallback: save one-by-one if bulk not supported
    const results = await Promise.all(
      payloads.map((p) => api.post(`/duty-schedules`, p))
    );
    return results.map((r) => r.data);
  }
}
export async function downloadDutyScheduleReportPdf(
  fromDate: string,
  toDate: string
): Promise<Blob> {
  const response = await api.get<Blob>("/duty-schedules/report/pdf", {
    params: {
      start: fromDate, // must match backend param name
      end: toDate,
    },
    responseType: "blob", //  important for pdf
  });

  return response.data;
}
// service
export async function getRecommendations(req: DutyRecommendationRequest) {
  const res = await api.post<OfficerRecommendation[]>("/duty-recommendations", req);
  return res.data;
}
