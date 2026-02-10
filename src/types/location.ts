export type LocationPoint = {
  id?: number;
  ts: string;
  latitude: number;
  longitude: number;
  accuracyM?: number | null;
  speedMps?: number | null;
  headingDeg?: number | null;
  provider?: string | null;
  officerBadgeNo?: string | null;
  meta?: any;
};
