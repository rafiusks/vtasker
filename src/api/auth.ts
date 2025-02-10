import type {
	LoginResponse,
	User,
	UserCreate,
	UserLogin,
	RefreshTokenResponse,
} from "../types/auth";
import { authAPI } from "./client";

export const register = async (data: UserCreate): Promise<User> => {
	const response = await authAPI.register(data);
	return response as User;
};

export const login = async (data: UserLogin): Promise<LoginResponse> => {
	const response = await authAPI.login(data);
	return response as LoginResponse;
};

export const refreshToken = async (
	refreshToken: string,
): Promise<RefreshTokenResponse> => {
	const response = await authAPI.refreshToken(refreshToken);
	return response as RefreshTokenResponse;
};

// Add auth token to all subsequent requests
export const setAuthToken = (token: string): void => {
	if (token) {
		authAPI.setAuthHeader(`Bearer ${token}`);
	}
};

// Remove auth token
export const removeAuthToken = (): void => {
	authAPI.removeAuthHeader();
};
