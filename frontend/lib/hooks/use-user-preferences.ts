"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";

interface Notifications {
	email: boolean;
	taskReminders: boolean;
	projectUpdates: boolean;
}

interface UserPreferences {
	theme: "light" | "dark" | "system";
	notifications: Notifications;
}

interface UserPreferencesState extends UserPreferences {
	isAuthenticated: boolean;
	updateTheme: (theme: "light" | "dark" | "system") => void;
	updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
	theme: "system",
	notifications: {
		email: false,
		taskReminders: false,
		projectUpdates: false,
	},
};

const useUserPreferencesStore = create<UserPreferencesState>()(
	persist(
		(set) => ({
			...defaultPreferences,
			isAuthenticated: false,
			updateTheme: (theme) => {
				set({ theme });
				// Update the document theme class
				if (typeof window !== "undefined") {
					const root = window.document.documentElement;
					root.classList.remove("light", "dark");
					if (theme === "system") {
						const systemTheme = window.matchMedia(
							"(prefers-color-scheme: dark)",
						).matches
							? "dark"
							: "light";
						root.classList.add(systemTheme);
					} else {
						root.classList.add(theme);
					}
				}
			},
			updatePreferences: (preferences) =>
				set((state) => ({
					...state,
					...preferences,
					notifications: {
						...state.notifications,
						...(preferences.notifications || {}),
					},
				})),
		}),
		{
			name: "user-preferences",
			storage: createJSONStorage(() => localStorage),
		},
	),
);

// Custom hook to handle hydration
export function useUserPreferences() {
	const [isHydrated, setIsHydrated] = useState(false);
	const store = useUserPreferencesStore();

	// Wait for hydration
	useEffect(() => {
		setIsHydrated(true);
	}, []);

	// Initialize theme on mount
	useEffect(() => {
		if (isHydrated) {
			const root = window.document.documentElement;
			root.classList.remove("light", "dark");
			if (store.theme === "system") {
				const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
					.matches
					? "dark"
					: "light";
				root.classList.add(systemTheme);

				// Listen for system theme changes
				const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
				const handleChange = (e: MediaQueryListEvent) => {
					if (store.theme === "system") {
						root.classList.remove("light", "dark");
						root.classList.add(e.matches ? "dark" : "light");
					}
				};

				mediaQuery.addEventListener("change", handleChange);
				return () => mediaQuery.removeEventListener("change", handleChange);
			} else {
				root.classList.add(store.theme);
			}
		}
	}, [isHydrated, store.theme]);

	return {
		theme: store.theme,
		notifications: store.notifications,
		updateTheme: store.updateTheme,
		updatePreferences: store.updatePreferences,
		isHydrated,
	};
}
