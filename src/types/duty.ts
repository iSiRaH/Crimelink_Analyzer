// src/types/duty.ts

export type OfficerDutyRow = {
  officerId: number;
  officerName: string;

  // These come from duty_schedule if already assigned
  location: string;
  datetime: string; // full ISO string "2025-11-25T08:00:00"
  status: string;
  description: string;

  // optional for save
  duration?: number;
  taskType?: string;
};

export type DutyCreatePayload = {
  officerId: number;
  date: string;
  duration: number;
  taskType: string;
  status: string;
  location: string;
  description: string;
  timeRange: string;
};

