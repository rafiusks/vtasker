export interface User {
	id: string;
	email: string;
	name: string;
	avatar_url?: string;
	createdAt: string;
}

export interface UserCreate {
	email: string;
	password: string;
	name: string;
	confirmPassword: string;
}

export interface UserLogin {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface LoginResponse {
	token: string;
	refresh_token: string;
	expires_in: number;
	refresh_expires_in: number;
	user: User;
}

export interface RefreshTokenResponse {
	token: string;
	expires_in: number;
}

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
}

export interface StoredAuthData {
	token: string;
	refresh_token: string;
	user: User;
	expiresAt: number;
	refreshExpiresAt: number;
}
