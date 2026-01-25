// Leave Types
// Backend should return enum-like values (recommended): PENDING | APPROVED | DENIED
export type LeaveStatus = "PENDING" | "APPROVED" | "DENIED";

export interface LeaveRequest {
  id: number;
  officerId: number;
  officerName: string;
  date: string; // YYYY-MM-DD format
  reason: string;
  status: LeaveStatus;
  requestedDate: string; // YYYY-MM-DD format
  responseReason?: string;
  respondedBy?: number;
  respondedDate?: string;
}

export interface LeaveSubmitRequest {
  officerId: number;
  date: string;
  reason: string;
}

export interface LeaveUpdateRequest {
  status: LeaveStatus;
  responseReason?: string;
}
