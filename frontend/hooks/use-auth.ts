"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
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
	signIn: (
		email: string,
		password: string,
		rememberMe?: boolean,
	) => Promise<void>;
	signUp: (email: string, password: string, name: string) => Promise<void>;
	signOut: () => Promise<void>;
	checkEmail: (email: string) => Promise<boolean>;
}

export const useAuth = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			isLoading: true,
			checkEmail: async (email: string) => {
				const { exists } = await authApi.checkEmail(email);
				return exists;
			},
			signIn: async (email: string, password: string, rememberMe = false) => {
				try {
					const { user, token } = await authApi.signIn(email, password);
					set({ user, isAuthenticated: true, isLoading: false });

					// Store the auth token based on rememberMe preference
					if (rememberMe) {
						localStorage.setItem("auth_token", token);
					} else {
						sessionStorage.setItem("auth_token", token);
					}
				} catch (error) {
					set({ user: null, isAuthenticated: false, isLoading: false });
					throw error;
				}
			},
			signUp: async (email: string, password: string, name: string) => {
				try {
					const { user, token } = await authApi.signUp(email, password, name);
					set({ user, isAuthenticated: true, isLoading: false });

					// For new registrations, we'll store the token in localStorage
					localStorage.setItem("auth_token", token);
				} catch (error) {
					set({ user: null, isAuthenticated: false, isLoading: false });
					throw error;
				}
			},
			signOut: async () => {
				// Remove auth token from both storages
				localStorage.removeItem("auth_token");
				sessionStorage.removeItem("auth_token");
				set({ user: null, isAuthenticated: false, isLoading: false });
			},
		}),
		{
			name: "auth-storage",
			skipHydration: true,
		},
	),
);
