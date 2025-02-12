export interface UserRole {
	id: number;
	code: string;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
}

export interface User {
	id: string;
	email: string;
	full_name: string;
	avatar_url?: string;
	role_code: string;
	created_at: string;
	updated_at: string;
	last_login_at?: string;
}

export interface UserCreate {
	email: string;
	password: string;
	full_name: string;
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
	user?: User;
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
