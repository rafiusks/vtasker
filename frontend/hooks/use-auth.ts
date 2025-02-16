"use client";

import { create } from "zustand";
import * as authApi from "@/lib/api/auth";

interface User {
	id: string;
	email: string;
	name: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	checkEmail: (email: string) => Promise<boolean>;
	signIn: (
		email: string,
		password: string,
		rememberMe?: boolean,
	) => Promise<void>;
	signUp: (email: string, password: string, name: string) => Promise<void>;
	signOut: () => void;
	updateAuthState: (user: User, rememberMe?: boolean) => void;
	initializeAuth: () => Promise<void>;
}

const useAuth = create<AuthState>()((set) => ({
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,

	initializeAuth: async () => {
		try {
			const token =
				localStorage.getItem("auth_token") ||
				sessionStorage.getItem("auth_token");
			if (!token) {
				return;
			}

			// Validate token by trying to fetch user sessions
			const response = await authApi.listSessions();
			if (response.error) {
				// Clear invalid tokens
				localStorage.removeItem("auth_token");
				sessionStorage.removeItem("auth_token");
				set({ user: null, isAuthenticated: false, error: null });
				return;
			}

			// If we can fetch sessions, the token is valid
			set({ isAuthenticated: true });
		} catch (error) {
			// Clear tokens on error
			localStorage.removeItem("auth_token");
			sessionStorage.removeItem("auth_token");
			set({ user: null, isAuthenticated: false, error: null });
		}
	},

	updateAuthState: (user: User, rememberMe = false) => {
		set({
			user,
			isAuthenticated: true,
			isLoading: false,
			error: null,
		});
	},

	checkEmail: async (email: string) => {
		try {
			const response = await authApi.checkEmail(email);
			if (!response.data) {
				throw new Error("Invalid response from server");
			}
			return response.data.exists;
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Failed to check email",
			});
			throw error;
		}
	},

	signIn: async (email: string, password: string, rememberMe = false) => {
		try {
			set({ isLoading: true, error: null });
			const response = await authApi.signIn(email, password);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (!response.data?.token || !response.data?.user) {
				throw new Error("Missing token or user in response");
			}

			set({
				user: response.data.user,
				isAuthenticated: true,
				isLoading: false,
			});

			// Store the auth token based on rememberMe preference
			if (rememberMe) {
				localStorage.setItem("auth_token", response.data.token);
			} else {
				sessionStorage.setItem("auth_token", response.data.token);
			}
		} catch (error) {
			set({
				isLoading: false,
				error: error instanceof Error ? error.message : "Failed to sign in",
				user: null,
				isAuthenticated: false,
			});
			throw error;
		}
	},

	signUp: async (email: string, password: string, name: string) => {
		try {
			set({ isLoading: true, error: null });
			const response = await authApi.signUp(email, password, name);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (!response.data?.token || !response.data?.user) {
				throw new Error("Missing token or user in response");
			}

			set({
				user: response.data.user,
				isAuthenticated: true,
				isLoading: false,
			});

			// For new registrations, store the token in localStorage
			localStorage.setItem("auth_token", response.data.token);
		} catch (error) {
			set({
				isLoading: false,
				error: error instanceof Error ? error.message : "Failed to sign up",
				user: null,
				isAuthenticated: false,
			});
			throw error;
		}
	},

	signOut: () => {
		localStorage.removeItem("auth_token");
		sessionStorage.removeItem("auth_token");
		set({ user: null, isAuthenticated: false, error: null });
	},
}));

export { useAuth };
export type { User };
