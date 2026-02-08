export type LeaveStatus = "PENDING" | "APPROVED" | "DENIED";

export interface LeaveRequest {
  id: number;
  officerId: number;
  officerName: string;
  date: string; // YYYY-MM-DD 
  reason: string;
  status: LeaveStatus;
  requestedDate: string; // YYYY-MM-DD
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
