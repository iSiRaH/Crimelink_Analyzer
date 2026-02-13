import type { LocationPoint } from "../types/location";
import type { OfficerInfo } from "../types/officers";
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

export async function fetchOfficerLastLocation(params: { badgeNo: string }) {
  const { badgeNo } = params;
  const res = await api.get<LocationPoint>(
    `/admin/officers/${badgeNo}/locations/last`,
  );
  return res.data;
}

export async function fetchFieldOfficers() {
  const res = await api.get<OfficerInfo[]>("/users/field-officers");
  return res.data;
}
