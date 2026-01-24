// Leave Types
export type LeaveStatus = "Pending" | "Approved" | "Denied";

export interface LeaveRequest {
  id: string;
  officerId: string;
  officerName: string;
  date: string; // YYYY-MM-DD format
  reason: string;
  status: LeaveStatus;
  requestedDate: string; // YYYY-MM-DD format
  responseReason?: string;
  respondedBy?: string;
  respondedDate?: string;
}

export interface LeaveSubmitRequest {
  officerId: string;
  date: string;
  reason: string;
}

export interface LeaveUpdateRequest {
  status: LeaveStatus;
  responseReason?: string;
}