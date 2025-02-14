import { QueryClient } from "@tanstack/react-query";
import type { ApiError } from "./client";

// Global error handler
const handleError = (error: ApiError) => {
	// Log the error
	console.error("API Error:", error.message);

	// You can add additional error handling here, such as:
	// - Showing a toast notification
	// - Redirecting to an error page
	// - Logging to an error tracking service
};

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
			retry: (failureCount, error) => {
				const apiError = error as ApiError;
				// Don't retry on 404s or auth errors
				if (apiError.code === "404" || apiError.code === "401") {
					return false;
				}
				return failureCount < 3;
			},
			refetchOnWindowFocus: true,
			refetchOnReconnect: true,
		},
		mutations: {
			retry: false,
			onError: (error: ApiError) => {
				// Global error handling for mutations
				console.error("Mutation error:", error.message);
			},
		},
	},
});
