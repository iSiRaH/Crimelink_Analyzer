import type { LocationPoint } from "../types/location";
import api from "./api";

export async function fetchOfficerLocations(params: {
  badgeNo: string;
  from: string;
  to: string;
}) {
  const { badgeNo, from, to } = params;
  const res = await api.get<LocationPoint[]>(
    `/admin/officers/${encodeURIComponent(badgeNo)}/locations`,
    { params: { from, to } },
  );
  return res.data;
}
