export interface User {
	id: string;
	email: string;
	name: string;
	createdAt: string;
}

export interface UserCreate {
	email: string;
	password: string;
	name: string;
}

export interface UserLogin {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface LoginResponse {
	token: string;
	refreshToken: string;
	user: User;
	expiresIn: number;
}

export interface RefreshTokenResponse {
	token: string;
	expiresIn: number;
}

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
}

export interface StoredAuthData {
	token: string;
	refreshToken: string;
	user: User;
	expiresAt: number;
	refreshExpiresAt: number;
}
