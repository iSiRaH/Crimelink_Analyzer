import api from "../services/api";
import type { OfficerDutyRow, DutyCreatePayload } from "../types/duty";

// GET officer rows for a date
export async function getOfficerRowsByDate(dateStr: string) {
  // baseURL already = "/api" so DO NOT add "/api" here
  let res;
  try {
    res = await api.get(`/duty-schedules/officers`, {
      params: { date: dateStr },
    });
  } catch (e) {
    res = await api.get(`/duty-schedule/officers/${dateStr}`);
    alert(e);
  }

  // backend may return: [], {data:[]}, or {rows:[]}
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
      r.officerName ?? r.name ?? r.officer_name ?? r.officer?.name ?? "";

    // datetime handling
    // case 1: backend sends full datetime → use directly
    // case 2: backend sends only time → rebuild full datetime
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
      duration: r.duration ?? 240,
      taskType: r.taskType ?? r.task_type ?? "General",
      status: r.status ?? "OPEN",
      description: r.description ?? "",
    } as OfficerDutyRow;
  });
}

// POST save duties (bulk)
export async function saveDutiesBulk(payloads: DutyCreatePayload[]) {
  if (!payloads || payloads.length === 0) return [];

  try {
    const res = await api.post(`/duty-schedules/bulk`, payloads);
    return res.data;
  } catch (bulkErr) {
    const results = await Promise.all(
      payloads.map((p) => api.post(`/duty-schedules`, p))
    );
    return results.map((r) => r.data);
  }
}
