// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Types for API responses
export interface ApiResponse<T> {
	data: T;
	message?: string;
}

export interface ApiError {
	message: string;
	code?: string;
	details?: unknown;
}

interface RequestConfig extends RequestInit {
	params?: Record<string, string>;
}

// Helper function to build URL with query parameters
function buildUrl(path: string, params?: Record<string, string>): string {
	const url = new URL(path, API_URL);
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.append(key, value);
		});
	}
	return url.toString();
}

// Generic API request function
export async function apiRequest<T>(
	path: string,
	config?: RequestConfig,
): Promise<ApiResponse<T>> {
	const { params, headers: customHeaders, ...restConfig } = config || {};

	// Prepare headers
	const headers = new Headers(customHeaders);
	if (!headers.has("Content-Type")) {
		headers.set("Content-Type", "application/json");
	}

	// Add auth token if available
	const token = localStorage.getItem("auth_token");
	if (token) {
		headers.set("Authorization", `Bearer ${token}`);
	}

	try {
		const response = await fetch(buildUrl(path, params), {
			...restConfig,
			headers,
		});

		if (!response.ok) {
			const error: ApiError = {
				message: "An error occurred",
				code: response.status.toString(),
			};

			try {
				const errorData = await response.json();
				error.message = errorData.message || error.message;
				error.details = errorData;
			} catch {
				// If parsing error response fails, use status text
				error.message = response.statusText;
			}

			throw error;
		}

		const data = await response.json();
		return data;
	} catch (error) {
		if (error instanceof Error) {
			throw {
				message: error.message,
				code: "NETWORK_ERROR",
			} satisfies ApiError;
		}
		throw error;
	}
}
