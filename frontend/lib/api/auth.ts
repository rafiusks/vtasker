import { apiRequest, type ApiResponse } from "./client";

interface CheckEmailResponse {
	exists: boolean;
}

interface User {
	id: string;
	email: string;
	name: string;
}

interface SignInResponse {
	token: string;
	user: User;
}

interface SignUpResponse {
	token: string;
	user: User;
}

export interface Session {
	id: string;
	userAgent: string;
	ipAddress: string;
	lastUsed: string;
	current: boolean;
}

type ErrorCode = "UNAUTHORIZED" | "REQUEST_FAILED" | "UNKNOWN_ERROR";

export async function checkEmail(
	email: string,
): Promise<ApiResponse<CheckEmailResponse>> {
	return apiRequest<CheckEmailResponse>("/auth/check-email", {
		method: "POST",
		body: JSON.stringify({ email }),
	});
}

export async function signIn(
	email: string,
	password: string,
): Promise<ApiResponse<SignInResponse>> {
	try {
		const response = await apiRequest<SignInResponse>("/auth/sign-in", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});

		if (response.error) {
			return response;
		}

		// Handle both wrapped and direct response structures
		if (!response.data && response.token && response.user) {
			const user = response.user as unknown as User;
			return {
				data: {
					token: response.token,
					user,
				},
				error: undefined,
			};
		}

		if (!response.data?.token || !response.data?.user) {
			return {
				error: {
					message: "Missing token or user in response",
					code: "INVALID_RESPONSE",
				},
			};
		}

		return response;
	} catch (error) {
		return {
			error: {
				message: error instanceof Error ? error.message : "Failed to sign in",
				code: "NETWORK_ERROR",
			},
		};
	}
}

export async function signUp(
	email: string,
	password: string,
	name: string,
): Promise<ApiResponse<SignInResponse>> {
	try {
		const response = await apiRequest<SignInResponse>("/auth/sign-up", {
			method: "POST",
			body: JSON.stringify({ email, password, name }),
		});

		if (response.error) {
			return response;
		}

		// Handle both wrapped and direct response structures
		if (!response.data && response.token && response.user) {
			const user = response.user as unknown as User;
			return {
				data: {
					token: response.token,
					user,
				},
				error: undefined,
			};
		}

		if (!response.data?.token || !response.data?.user) {
			return {
				error: {
					message: "Missing token or user in response",
					code: "INVALID_RESPONSE",
				},
			};
		}

		return response;
	} catch (error) {
		return {
			error: {
				message: error instanceof Error ? error.message : "Failed to sign up",
				code: "NETWORK_ERROR",
			},
		};
	}
}

export async function listSessions(): Promise<ApiResponse<Session[]>> {
	try {
		const response = await apiRequest<Session[]>("/auth/sessions");
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
