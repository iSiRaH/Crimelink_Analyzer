// src/api/dutyService.ts
import api from "../services/api";
import type { OfficerDutyRow, DutyCreatePayload } from "../types/duty";

// GET officers rows for date
export async function getOfficerRowsByDate(dateStr: string) {
  // dateStr already like "2025-11-25"
  const res = await api.get<OfficerDutyRow[]>(
    `/api/duty-schedules/officers?date=${dateStr}`
  );

  // Backend sends: officerId, name, location, time, status, description
  // We need to normalize to OfficerDutyRow
  return res.data.map((r: any) => ({
    officerId: r.officerId,
    officerName: r.name,
    location: r.location || "",
    datetime: r.time
      ? `${dateStr}T${r.time}:00`
      : "", // rebuild full ISO if time exists
    status: r.status || "",
    description: r.description || "",
  }));
}

// POST save duties (multiple single saves)
export async function saveDutiesBulk(payloads: DutyCreatePayload[]) {
  await Promise.all(
    payloads.map((p) => api.post("/api/duty-schedules", p))
  );
}
