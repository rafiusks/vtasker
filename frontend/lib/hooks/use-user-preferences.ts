import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useEffect } from "react";

interface UserPreferences {
	theme: "light" | "dark" | "system";
	notifications: {
		email: boolean;
		taskReminders: boolean;
		projectUpdates: boolean;
	};
}

const defaultPreferences: UserPreferences = {
	theme: "light",
	notifications: {
		email: false,
		taskReminders: false,
		projectUpdates: false,
	},
};

export function useUserPreferences() {
	const { theme, setTheme } = useTheme();
	const queryClient = useQueryClient();

	// Fetch user preferences from backend
	const { data: preferences } = useQuery({
		queryKey: ["user-preferences"],
		queryFn: async (): Promise<UserPreferences> => {
			try {
				const response = await fetch("/api/user/preferences");
				if (!response.ok) {
					return defaultPreferences;
				}
				return response.json();
			} catch (error) {
				return defaultPreferences;
			}
		},
		// Don't retry on error since we're returning defaults
		retry: false,
	});

	// Update preferences in backend
	const { mutate: updatePreferences } = useMutation({
		mutationFn: async (newPreferences: Partial<UserPreferences>) => {
			const response = await fetch("/api/user/preferences", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newPreferences),
			});
			if (!response.ok) {
				throw new Error("Failed to update preferences");
			}
			return response.json();
		},
		onSuccess: (data) => {
			// Update the cached preferences
			queryClient.setQueryData(
				["user-preferences"],
				(old: UserPreferences) => ({
					...old,
					...data,
				}),
			);
		},
	});

	// Set theme based on preferences
	useEffect(() => {
		if (preferences?.theme) {
			setTheme(preferences.theme);
		} else {
			setTheme("light");
		}
	}, [preferences?.theme, setTheme]);

	const updateTheme = (newTheme: "light" | "dark" | "system") => {
		// Update theme immediately for better UX
		setTheme(newTheme);
		// Update in backend and cache
		updatePreferences({ theme: newTheme });
	};

	return {
		preferences: preferences ?? defaultPreferences,
		updatePreferences,
		theme,
		updateTheme,
		isAuthenticated: true, // We'll handle auth state separately
	};
}
