export type OfficerDutyRow = {
  officerId: number;
  officerName: string;

  scheduleId: number | null;
  datetime: string | null;

  duration: number | null;
  taskType: string | null;
  status: string;
  location: string;
  description: string;
};

export type DutyCreatePayload = {
  datetime: string;
  duration: number;
  taskType: string;
  status: string;
  assignedOfficer: number;
  location: string;
  description: string;
};
