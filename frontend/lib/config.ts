// API Configuration
const isBrowser = typeof window !== "undefined";
const isServer = !isBrowser;

// For server-side calls in Docker, use the Docker service name
// For client-side calls, use the public URL
const defaultApiUrl =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const serverApiUrl = "http://vtasker-backend:8080";

// Use localhost for client-side requests in Docker
const clientApiUrl = isBrowser ? "http://localhost:8080" : defaultApiUrl;

export const API_URL = clientApiUrl;
export const API_BASE_PATH = process.env.NEXT_PUBLIC_API_BASE_PATH || "/api/v1";

// Auth Configuration
export const AUTH_TOKEN_KEY = "auth_token";
export const AUTH_USER_KEY = "auth_user";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// API Endpoints
export const ENDPOINTS = {
	AUTH: {
		SIGN_IN: "auth/sign-in",
		SIGN_UP: "auth/sign-up",
		CHECK_EMAIL: "auth/check-email",
		SIGN_OUT: "auth/sign-out",
	},
	PROJECTS: {
		BASE: "projects",
		DETAIL: (id: string) => `projects/${id}`,
	},
	ISSUES: {
		BASE: "issues",
		DETAIL: (id: string) => `issues/${id}`,
		BY_PROJECT: (projectId: string) => `projects/${projectId}/issues`,
	},
	USER: {
		PROFILE: "user/profile",
		SETTINGS: "user/settings",
	},
} as const;

// Helper Functions
export const getApiUrl = (path: string): string => {
	// Remove leading slash if present to avoid double slashes
	const cleanPath = path.startsWith("/") ? path.slice(1) : path;

	// Use the appropriate base URL depending on whether we're on the client or server
	const baseUrl = isServer ? serverApiUrl : clientApiUrl;

	// Log the URL construction for debugging
	console.log("API URL construction:", {
		isServer,
		baseUrl,
		path: cleanPath,
		finalUrl: `${baseUrl}${API_BASE_PATH}/${cleanPath}`,
	});

	return `${baseUrl}${API_BASE_PATH}/${cleanPath}`;
};

export const getEndpointUrl = (endpoint: string): string => {
	return getApiUrl(endpoint);
};

// Common query parameters builder
export const buildQueryParams = (
	params: Record<string, string | number | boolean | undefined>,
): string => {
	const queryParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			queryParams.append(key, String(value));
		}
	}
	return queryParams.toString();
};

// Common request headers
export const getDefaultHeaders = (
	includeAuth = true,
	requestHeaders?: Headers,
) => {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (includeAuth) {
		// For server-side requests, try to get the token from the request headers
		if (isServer && requestHeaders) {
			// Try different possible header names
			const authHeader =
				requestHeaders.get("authorization") ||
				requestHeaders.get("Authorization") ||
				requestHeaders.get("Authorization") ||
				requestHeaders.get("AUTHORIZATION");

			console.log("Server-side auth header check:", {
				found: !!authHeader,
				headerValue: authHeader,
			});

			if (authHeader) {
				headers.Authorization = authHeader;
			}
		}
		// For client-side requests, get the token from storage
		else if (isBrowser) {
			const token =
				localStorage.getItem(AUTH_TOKEN_KEY) ||
				sessionStorage.getItem(AUTH_TOKEN_KEY);

			console.log("Client-side token check:", {
				found: !!token,
			});

			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}
		}
	}

	return headers;
};
