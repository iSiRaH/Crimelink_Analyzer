// src/api/dutyService.ts
import api from "../services/api";
import type { OfficerDutyRow, DutyCreatePayload } from "../types/duty";

// GET officer rows for a date
export async function getOfficerRowsByDate(dateStr: string) {
  // baseURL already = "/api" so DO NOT add "/api" here
  const res = await api.get(`/duty-schedules/officers`, {
    params: { date: dateStr },
  });

  // backend may return: [], {data:[]}, or {rows:[]}
  const rawList: any[] = Array.isArray(res.data)
    ? res.data
    : res.data?.rows || res.data?.data || [];

  return rawList.map((r: any) => {
    const officerId =
      r.officerId ??
      r.assignedOfficer ??
      r.officer_id ??
      r.officer?.id;

    const officerName =
      r.name ??
      r.officerName ??
      r.officer_name ??
      r.officer?.name ??
      "";

    // datetime handling
    // case 1: backend sends full datetime → use directly
    // case 2: backend sends only time → rebuild full datetime
    const datetime =
      r.datetime
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
      taskType: r.taskType ?? "General",
      status: r.status ?? "OPEN",
      description: r.description ?? "",
    } as OfficerDutyRow;
  });
}

// POST save duties (bulk)
export async function saveDutiesBulk(payloads: DutyCreatePayload[]) {
  // If your backend supports bulk:
  // return api.post("/duty-schedules/bulk", payloads);

  await Promise.all(
    payloads.map((p) => api.post("/duty-schedules", p))
  );
}
