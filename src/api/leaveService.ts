import axios from "axios";
import type { LeaveRequest, LeaveUpdateRequest } from "../types/leave";

const API_BASE_URL = "http://localhost:8080/api"; // Update with your backend URL

export const getAllLeaveRequests = async (
  month: string // Format: YYYY-MM
): Promise<LeaveRequest[]> => {
  const response = await axios.get(`${API_BASE_URL}/leaves/all`, {
    params: { month },
  });
  return response.data;
};

export const updateLeaveStatus = async (
  leaveId: string,
  update: LeaveUpdateRequest
): Promise<LeaveRequest> => {
  const response = await axios.put(
    `${API_BASE_URL}/leaves/${leaveId}/status`,
    update
  );
  return response.data;
};