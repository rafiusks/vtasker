import { ENDPOINTS, getEndpointUrl, getDefaultHeaders } from "@/lib/config";

interface ApiResponse<T> {
	data?: T;
	error?: {
		message: string;
		code: string;
	};
}

interface CheckEmailRequest {
	email: string;
}

interface CheckEmailData {
	exists: boolean;
}

interface CheckEmailResponse {
	data: CheckEmailData;
}

interface SignInRequest {
	email: string;
	password: string;
	rememberMe?: boolean;
}

interface SignInData {
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
	};
}

interface SignInResponse {
	data: SignInData;
}

interface SignUpRequest {
	email: string;
	password: string;
	name: string;
}

interface SignUpResponse {
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
	};
}

export interface Session {
	id: string;
	userAgent: string;
	ipAddress: string;
	lastUsed: string;
	current: boolean;
}

type ErrorCode = "UNAUTHORIZED" | "REQUEST_FAILED" | "UNKNOWN_ERROR";

// Generic API request function
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const response = await fetch(getEndpointUrl(endpoint), {
		...options,
		headers: {
			...getDefaultHeaders(false),
			...(options.headers || {}),
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	return response.json();
}

export async function checkEmail(email: string): Promise<CheckEmailResponse> {
	return apiRequest<CheckEmailResponse>(ENDPOINTS.AUTH.CHECK_EMAIL, {
		method: "POST",
		body: JSON.stringify({ email }),
	});
}

export async function signIn(data: SignInRequest): Promise<SignInResponse> {
	return apiRequest<SignInResponse>(ENDPOINTS.AUTH.SIGN_IN, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
	return apiRequest<SignUpResponse>(ENDPOINTS.AUTH.SIGN_UP, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function listSessions(): Promise<ApiResponse<Session[]>> {
	try {
		const response = await apiRequest<ApiResponse<Session[]>>("/auth/sessions");
		return response;
	} catch (error) {
		return {
			data: [],
			error: {
				message:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				code: "NETWORK_ERROR",
			},
		};
	}
}

export async function revokeSession(
	sessionId: string,
): Promise<ApiResponse<void>> {
	try {
		return await apiRequest("/auth/sessions/revoke", {
			method: "POST",
			body: JSON.stringify({ sessionId }),
		});
	} catch (error) {
		return {
			error: {
				message:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				code: "NETWORK_ERROR",
			},
		};
	}
}

export async function revokeAllSessions(): Promise<ApiResponse<void>> {
	try {
		return await apiRequest("/auth/sessions/revoke-all", {
			method: "POST",
		});
	} catch (error) {
		return {
			error: {
				message:
					error instanceof Error
						? error.message
						: "An unexpected error occurred",
				code: "NETWORK_ERROR",
			},
		};
	}
}
