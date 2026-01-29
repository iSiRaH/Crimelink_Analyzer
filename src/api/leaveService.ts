import axios from "axios";
import type { LeaveRequest, LeaveUpdateRequest } from "../types/leave";

const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  (import.meta as any)?.env?.VITE_BACKEND_URL ||
  "http://localhost:8080/api";

/**
 * Get all leave requests for a given month.
 * Backend: GET /api/leaves/all?month=YYYY-MM
 */
export const getAllLeaveRequests = async (month: string): Promise<LeaveRequest[]> => {
  const res = await axios.get(`${API_BASE_URL}/leaves/all`, {
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
  const res = await axios.put(`${API_BASE_URL}/leaves/${leaveId}/status`, update);
  return res.data;
};
