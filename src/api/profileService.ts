// src/api/profileService.ts
import api from "../services/api";

export interface ProfileData {
  userId: number;
  name: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  role: string;
  badgeNo: string;
  status: string;
}

export interface ProfileUpdateRequest {
  name: string;
  email: string;
  dob?: string;
  gender?: string;
  address?: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AdminPasswordResetRequest {
  userId: number;
  newPassword: string;
}

/**
 * Get current user's profile
 */
export const getProfile = async (): Promise<ProfileData> => {
  const response = await api.get<ProfileData>("/profile");
  return response.data;
};

/**
 * Update current user's profile
 */
export const updateProfile = async (
  data: ProfileUpdateRequest
): Promise<{ message: string; profile: ProfileData }> => {
  const response = await api.put<{ message: string; profile: ProfileData }>(
    "/profile",
    data
  );
  return response.data;
};

/**
 * Change current user's password
 */
export const changePassword = async (
  data: PasswordChangeRequest
): Promise<{ message: string }> => {
  const response = await api.put<{ message: string }>(
    "/profile/password",
    data
  );
  return response.data;
};

/**
 * Admin: Reset any user's password
 */
export const adminResetPassword = async (
  data: AdminPasswordResetRequest
): Promise<{ message: string; info: string }> => {
  const response = await api.post<{ message: string; info: string }>(
    "/admin/reset-password",
    data
  );
  return response.data;
};
