import type { DutyStatus } from "./duty";

export interface User {
  userId: number;
  name: string;
  dob: string;
  gender: string;
  address: string;
  role: 'Admin' | 'OIC' | 'Investigator';
  badgeNo: string;
  email: string;
  status: DutyStatus;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateUserProfile?: (updatedUser: { userId: number; name: string; role: string }) => void;
}
