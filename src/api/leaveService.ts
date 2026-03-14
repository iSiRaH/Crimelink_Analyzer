import api from "../services/api";
import type { LeaveRequest, LeaveUpdateRequest } from "../types/leave";

/**
 * Get all leave requests for a given month.
 * Backend: GET /api/leaves/all?month=YYYY-MM
 */
export const getAllLeaveRequests = async (month: string): Promise<LeaveRequest[]> => {
  const res = await api.get("/leaves/all", {
    params: { month },
  });
  return res.data;
};

/**
 * Update leave status.
 * Backend: PUT /api/leaves/{leaveId}/status
 */
export const updateLeaveStatus = async (
  leaveId: number,
  update: LeaveUpdateRequest
): Promise<LeaveRequest> => {
  const res = await api.put(`/leaves/${leaveId}/status`, update);
  return res.data;
};
