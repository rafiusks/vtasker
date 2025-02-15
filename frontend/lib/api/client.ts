const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Types for API responses
export interface ApiResponse<T> {
	data: T;
	message?: string;
}

export interface ApiError {
	message: string;
	code?: ErrorCode;
	details?: unknown;
}

// Specific error codes for better error handling
export type ErrorCode =
	| "NETWORK_ERROR"
	| "INVALID_CREDENTIALS"
	| "ACCOUNT_LOCKED"
	| "EMAIL_TAKEN"
	| "INVALID_PASSWORD"
	| "PASSWORD_TOO_WEAK"
	| "EMAIL_NOT_VERIFIED"
	| "RATE_LIMIT_EXCEEDED"
	| "ACCOUNT_DISABLED"
	| "SESSION_EXPIRED"
	| "INVALID_TOKEN"
	| "SERVER_ERROR";

// Error messages for different scenarios
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	NETWORK_ERROR:
		"Unable to connect to the server. Please check your internet connection.",
	INVALID_CREDENTIALS: "The email or password you entered is incorrect.",
	ACCOUNT_LOCKED:
		"Your account has been locked due to multiple failed attempts. Please reset your password.",
	EMAIL_TAKEN:
		"This email is already registered. Please sign in or use a different email.",
	INVALID_PASSWORD: "Please enter a valid password.",
	PASSWORD_TOO_WEAK:
		"Password is too weak. It should contain at least 8 characters, including uppercase, lowercase, numbers, and symbols.",
	EMAIL_NOT_VERIFIED: "Please verify your email address before signing in.",
	RATE_LIMIT_EXCEEDED: "Too many attempts. Please try again later.",
	ACCOUNT_DISABLED: "This account has been disabled. Please contact support.",
	SESSION_EXPIRED: "Your session has expired. Please sign in again.",
	INVALID_TOKEN: "Your authentication token is invalid. Please sign in again.",
	SERVER_ERROR: "An unexpected error occurred. Please try again later.",
};

// Helper function to get user-friendly error message
export function getErrorMessage(error: ApiError): string {
	if (error.code && ERROR_MESSAGES[error.code]) {
		return ERROR_MESSAGES[error.code];
	}
	return error.message || "An unexpected error occurred. Please try again.";
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
	const token =
		localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
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

			// Handle 401 unauthorized
			if (response.status === 401) {
				localStorage.removeItem("auth_token");
				sessionStorage.removeItem("auth_token");
				window.location.href = "/auth";
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
