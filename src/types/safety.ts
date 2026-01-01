export type safetyTypes = [
  "POLICE",
  "HOSPITAL",
  "FIRE_STATION",
  "SHELTER",
  "SAFE_HEAVEN",
  "COMMUNITY_CENTER",
  "SECURITY_POST",
  "LIBRARY"
];

export type markerType = {
  id?: string;
  latitude: number;
  longitude: number;
  name?: string;
};
