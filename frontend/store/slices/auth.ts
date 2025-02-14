import { StateCreator } from "zustand";
import { AuthState } from "../types";

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,

	login: async (email: string, password: string) => {
		set({ isLoading: true, error: null });
		try {
			// TODO: Implement actual API call
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			if (!response.ok) {
				throw new Error("Login failed");
			}

			const user = await response.json();
			set({ user, isAuthenticated: true, isLoading: false });
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : "Login failed",
				isLoading: false,
			});
		}
	},

	logout: () => {
		// TODO: Implement actual API call
		set({ user: null, isAuthenticated: false });
	},

	clearError: () => {
		set({ error: null });
	},
});
