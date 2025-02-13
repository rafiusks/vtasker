import type { ReactNode } from "react";
import type { User } from "../../types/auth";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokenReady: boolean;
  login: (
    token: string,
    refreshToken: string,
    user: User,
    expiresIn: number,
    refreshExpiresIn: number,
    rememberMe?: boolean,
  ) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
}

export const REFRESH_THRESHOLD = 5 * 60; // Refresh token 5 minutes before expiry 