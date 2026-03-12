export type crimeReportType = {
  reportId?: number;
  longitude: number;
  latitude: number;
  description: string;
  dateReported: string;
  timeReported: string;
  crimeType: crimeType;
  evidences?: evidenceType[];
};

export type evidenceType = {
  evidenceId?: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  downloadUrl?: string;
};

export type crimeLocationType = {
  latitude: number;
  longitude: number;
  crimeType: crimeType;
};

export const crimeType = {
  THEFT: "THEFT",
  ASSAULT: "ASSAULT",
  BURGLARY: "BURGLARY",
  ROBBERY: "ROBBERY",
  VANDALISM: "VANDALISM",
  DRUG_OFFENSE: "DRUG_OFFENSE",
  TRAFFIC_VIOLATION: "TRAFFIC_VIOLATION",
  HOMICIDE: "HOMICIDE",
  FRAUD: "FRAUD",
  ARSON: "ARSON",
} as const;

export type crimeType = (typeof crimeType)[keyof typeof crimeType];
