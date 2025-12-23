import api from "../services/api";

export interface User {
  userId?: number;
  name: string;
  email: string;
  dob?: string;
  gender?: string;
  address?: string;
  role: string;
  badgeNo?: string;
  status: string;
  passwordHash?: string;
}

export interface AuditLog {
  email: string;
  id: number;
  userId?: number;
  userName?: string;
  action: string;
  ipAddress?: string;
  loginTime?: string;
  logoutTime?: string;
  success: boolean;
}

export interface SystemHealthResponse {
  status: string;
  database: string;
  timestamp: string;
}

/**
 * Get all users
 * GET /api/admin/users
 */
export async function getAllUsers(): Promise<User[]> {
  const res = await api.get("/admin/users");
  return res.data;
}

/**
 * Get users by role
 * GET /api/admin/users?role=Admin
 */
export async function getUsersByRole(role: string): Promise<User[]> {
  const res = await api.get("/admin/users", { params: { role } });
  return res.data;
}

/**
 * Get users by status
 * GET /api/admin/users?status=Active
 */
export async function getUsersByStatus(status: string): Promise<User[]> {
  const res = await api.get("/admin/users", { params: { status } });
  return res.data;
}

/**
 * Create new user
 * POST /api/admin/users
 */
export async function createUser(user: User): Promise<User> {
  const res = await api.post("/admin/users", user);
  return res.data;
}

/**
 * Update existing user
 * PUT /api/admin/users/{id}
 */
export async function updateUser(userId: number, user: User): Promise<User> {
  const res = await api.put(`/admin/users/${userId}`, user);
  return res.data;
}

/**
 * Deactivate user (set status to Inactive)
 * DELETE /api/admin/users/{id}
 */
export async function deactivateUser(userId: number): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}

/**
 * Get audit logs
 * GET /api/admin/audit-logs
 */
export async function getAuditLogs(
  limit?: number,
  offset?: number
): Promise<AuditLog[]> {
  const res = await api.get("/admin/audit-logs", {
    params: { limit, offset },
  });
  return res.data;
}

/**
 * Trigger database backup
 * POST /api/admin/backup
 */
export async function triggerBackup(): Promise<{ message: string; file: string }> {
  const res = await api.post("/admin/backup");
  return res.data;
}

/**
 * Restore from backup
 * POST /api/admin/restore
 */
export async function restoreBackup(filename: string): Promise<{ message: string }> {
  const res = await api.post("/admin/restore", { filename });
  return res.data;
}

/**
 * Get system health status
 * GET /api/admin/health
 */
export async function getSystemHealth(): Promise<SystemHealthResponse> {
  const res = await api.get("/admin/health");
  return res.data;
}
