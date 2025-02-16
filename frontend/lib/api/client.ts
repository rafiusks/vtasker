const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Types for API responses
export interface ApiResponse<T> {
	data?: T;
	error?: ApiError;
	// Add direct response fields
	token?: string;
	user?: T;
	[key: string]: unknown;
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
	| "SERVER_ERROR"
	| "INVALID_REQUEST"
	| "USER_NOT_FOUND"
	| "INVALID_RESPONSE";

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
	INVALID_REQUEST: "Please check your input and try again.",
	USER_NOT_FOUND: "No account found with this email. Please sign up first.",
	INVALID_RESPONSE:
		"The server returned an invalid response. Please try again.",
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
		for (const [key, value] of Object.entries(params)) {
			url.searchParams.append(key, value);
		}
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
		// Remove any existing Bearer prefix to avoid duplication
		const cleanToken = token.replace(/^Bearer\s+/, "");
		headers.set("Authorization", `Bearer ${cleanToken}`);
	}

	try {
		const response = await fetch(buildUrl(path, params), {
			...restConfig,
			headers,
		});

		if (!response.ok) {
			// Handle 401 Unauthorized specifically
			if (response.status === 401) {
				// Clear tokens if they're invalid
				localStorage.removeItem("auth_token");
				sessionStorage.removeItem("auth_token");
				return {
					error: {
						message: "Your session has expired. Please sign in again.",
						code: "SESSION_EXPIRED",
					},
				};
			}

			// Try to parse error response as JSON
			let errorData: { message?: string; code?: ErrorCode; details?: unknown } =
				{};
			try {
				errorData = await response.json();
			} catch {
				// If response is not JSON, use text content
				const text = await response.text();
				errorData = {
					message: text || "An unexpected error occurred",
					code: response.status === 404 ? "INVALID_REQUEST" : "SERVER_ERROR",
				};
			}

			return {
				error: {
					message: errorData.message || "An unexpected error occurred",
					code: errorData.code || "SERVER_ERROR",
					details: errorData.details,
				},
			};
		}

		const data = await response.json();
		return data as ApiResponse<T>;
	} catch (error) {
		if (error instanceof TypeError && error.message === "Failed to fetch") {
			return {
				error: {
					message: "Unable to connect to the server",
					code: "NETWORK_ERROR",
				},
			};
		}

		return {
			error: {
				message:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				code: "SERVER_ERROR",
			},
		};
	}
}
