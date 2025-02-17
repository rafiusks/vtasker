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
			set({ isLoading: true });
			const localStorageToken = localStorage.getItem("auth_token");
			const sessionStorageToken = sessionStorage.getItem("auth_token");
			const cookieToken = document.cookie
				.split(";")
				.find((c) => c.trim().startsWith("auth_token="))
				?.split("=")[1];

			const token = localStorageToken || sessionStorageToken || cookieToken;

			console.log("Auth initialization:", {
				hasLocalStorage: !!localStorageToken,
				hasSessionStorage: !!sessionStorageToken,
				hasCookie: !!cookieToken,
				finalToken: token ? "present" : "none",
			});

			if (!token) {
				set({
					user: null,
					isAuthenticated: false,
					error: null,
					isLoading: false,
				});
				return;
			}

			// Ensure token consistency across storage methods
			if (localStorageToken) {
				sessionStorage.removeItem("auth_token");
				document.cookie = `auth_token=${localStorageToken}; path=/`;
			} else if (sessionStorageToken) {
				document.cookie = `auth_token=${sessionStorageToken}; path=/`;
			} else if (cookieToken) {
				sessionStorage.setItem("auth_token", cookieToken);
			}

			// Validate token by trying to fetch user profile
			const response = await authApi.getProfile();
			if (response.error) {
				console.error("Profile fetch error:", response.error);
				// Clear invalid tokens
				localStorage.removeItem("auth_token");
				sessionStorage.removeItem("auth_token");
				document.cookie =
					"auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
				set({
					user: null,
					isAuthenticated: false,
					error: null,
					isLoading: false,
				});
				return;
			}

			// If we can fetch the profile, the token is valid
			set({
				user: response.data,
				isAuthenticated: true,
				error: null,
				isLoading: false,
			});
		} catch (error) {
			console.error("Auth initialization error:", error);
			// Clear tokens on error
			localStorage.removeItem("auth_token");
			sessionStorage.removeItem("auth_token");
			document.cookie =
				"auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
			set({
				user: null,
				isAuthenticated: false,
				error: null,
				isLoading: false,
			});
		}
	},

	updateAuthState: (user: User, rememberMe = false) => {
		// Get the current token
		const token =
			localStorage.getItem("auth_token") ||
			sessionStorage.getItem("auth_token") ||
			document.cookie
				.split(";")
				.find((c) => c.trim().startsWith("auth_token="))
				?.split("=")[1];

		if (token) {
			// Update token storage based on rememberMe preference
			if (rememberMe) {
				localStorage.setItem("auth_token", token);
				sessionStorage.removeItem("auth_token");
			} else {
				sessionStorage.setItem("auth_token", token);
				localStorage.removeItem("auth_token");
			}
			// Always keep the cookie in sync
			document.cookie = `auth_token=${token}; path=/`;
		}

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

			// Store the auth token based on rememberMe preference
			if (rememberMe) {
				localStorage.setItem("auth_token", response.data.token);
			} else {
				sessionStorage.setItem("auth_token", response.data.token);
			}

			// Set the token in the cookie for API requests
			document.cookie = `auth_token=${response.data.token}; path=/`;

			set({
				user: response.data.user,
				isAuthenticated: true,
				isLoading: false,
			});
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

			// For new registrations, store the token in localStorage
			localStorage.setItem("auth_token", response.data.token);
			// Set the token in the cookie for API requests
			document.cookie = `auth_token=${response.data.token}; path=/`;

			set({
				user: response.data.user,
				isAuthenticated: true,
				isLoading: false,
			});
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
		document.cookie =
			"auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
		set({ user: null, isAuthenticated: false, error: null });
	},
}));

export { useAuth };
export type { User };
