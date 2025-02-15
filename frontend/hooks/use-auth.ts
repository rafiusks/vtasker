"use client";

import { create } from "zustand";

interface User {
	id: string;
	email: string;
	name: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
	user: null,
	isAuthenticated: false,
	isLoading: true,
	signIn: async (email: string, password: string) => {
		try {
			// TODO: Implement actual sign in logic
			const mockUser = {
				id: "1",
				email,
				name: "John Doe",
			};
			set({ user: mockUser, isAuthenticated: true, isLoading: false });
		} catch (error) {
			set({ user: null, isAuthenticated: false, isLoading: false });
			throw error;
		}
	},
	signOut: async () => {
		// TODO: Implement actual sign out logic
		set({ user: null, isAuthenticated: false, isLoading: false });
	},
}));
