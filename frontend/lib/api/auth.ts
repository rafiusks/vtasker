import type { User } from "@/hooks/use-auth";

interface ApiResponse<T> {
	data?: T;
	error?: {
		message: string;
		endpoint?: string;
		status?: number;
	};
}

interface SignInResponse {
	token: string;
	user: User;
}

interface SignUpResponse {
	token: string;
	user: User;
}

interface CheckEmailResponse {
	exists: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getProfile(): Promise<ApiResponse<User>> {
	try {
		// Get the token from storage
		const token =
			localStorage.getItem("auth_token") ||
			sessionStorage.getItem("auth_token") ||
			document.cookie
				.split(";")
				.find((c) => c.trim().startsWith("auth_token="))
				?.split("=")[1];

		if (!token) {
			console.log("No token found in any storage location");
			return {
				error: {
					message: "No authentication token found",
				},
			};
		}

		// Clean the token (remove Bearer if present)
		const cleanToken = token.replace(/^Bearer\s+/i, "");

		// Get the current user's ID from the token
		let userId: string;
		try {
			const tokenPayload = JSON.parse(atob(cleanToken.split(".")[1]));
			userId = tokenPayload.user_id;
			console.log("Extracted user ID from token:", { userId });
		} catch (error) {
			console.error("Failed to extract user ID from token:", error);
			return {
				error: {
					message: "Invalid authentication token",
				},
			};
		}

		// Use the standard users endpoint with the user's ID
		const endpoint = `/api/v1/users/${userId}`;
		const url = `${API_BASE_URL}${endpoint}`;

		console.log("Fetching user profile:", {
			url,
			endpoint,
			userId,
		});

		const response = await fetch(url, {
			method: "GET",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${cleanToken}`,
			},
		});

		// Log response details for debugging
		const responseHeaders = Object.fromEntries(response.headers.entries());
		console.log("Profile fetch response:", {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
			url: response.url,
		});

		if (!response.ok) {
			const contentType = response.headers.get("content-type");
			let errorMessage = "Failed to fetch profile";

			try {
				if (contentType?.includes("application/json")) {
					const errorData = await response.json();
					console.error("Profile fetch JSON error:", errorData);
					errorMessage = errorData.message || errorData.error || errorMessage;
				} else {
					const errorText = await response.text();
					console.error("Profile fetch text error:", {
						text: errorText,
						status: response.status,
						url: response.url,
					});
					errorMessage = errorText || errorMessage;
				}
			} catch (parseError) {
				console.error("Error parsing error response:", parseError);
			}

			return {
				error: {
					message: errorMessage,
					status: response.status,
				},
			};
		}

		const data = await response.json();
		console.log("Profile data:", {
			...data,
			user: data.user ? "present" : "missing",
		});

		// Handle nested data structure
		const userData = data.data || data;

		// Validate user data
		if (!userData || !userData.id || !userData.email) {
			console.error("Invalid user data format:", userData);
			return {
				error: {
					message: "Invalid user data format received from server",
				},
			};
		}

		return { data: userData };
	} catch (error) {
		console.error("Profile fetch error:", error);
		return {
			error: {
				message:
					error instanceof Error ? error.message : "Failed to fetch profile",
			},
		};
	}
}

async function signIn(
	email: string,
	password: string,
	rememberMe = false,
): Promise<ApiResponse<SignInResponse>> {
	try {
		// Log the request details
		const requestBody = {
			email,
			password,
			rememberMe,
		};
		console.log("Sign in request:", {
			url: `${API_BASE_URL}/api/v1/auth/sign-in`,
			body: { ...requestBody, password: "***" },
		});

		const response = await fetch(`${API_BASE_URL}/api/v1/auth/sign-in`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		// Log the response details
		console.log("Sign in response status:", {
			status: response.status,
			statusText: response.statusText,
			headers: Object.fromEntries(response.headers.entries()),
		});

		if (!response.ok) {
			// Check if the response is JSON
			const contentType = response.headers.get("content-type");
			if (contentType?.includes("application/json")) {
				const errorData = await response.json();
				console.error("Sign in JSON error:", errorData);
				return {
					error: {
						message: errorData.message || "Invalid credentials",
					},
				};
			}

			// Handle plain text error
			const errorText = await response.text();
			console.error("Sign in error response:", {
				status: response.status,
				text: errorText,
				contentType,
			});
			return {
				error: {
					message: errorText || "Invalid credentials",
				},
			};
		}

		const responseData = await response.json();
		console.log("Sign in success response:", {
			...responseData,
			token: responseData.token ? "present" : "missing",
			user: responseData.user ? "present" : "missing",
		});

		// Handle nested data structure
		const data = responseData.data || responseData;

		if (!data.token || !data.user) {
			console.error("Invalid response format:", {
				...responseData,
				token: responseData.token ? "present" : "missing",
				user: responseData.user ? "present" : "missing",
			});
			return {
				error: {
					message: "Invalid response format from server",
				},
			};
		}

		// Store the token based on rememberMe preference
		try {
			if (rememberMe) {
				localStorage.setItem("auth_token", data.token);
				console.log("Token stored in localStorage");
			} else {
				sessionStorage.setItem("auth_token", data.token);
				console.log("Token stored in sessionStorage");
			}

			// Always set the cookie for API requests
			document.cookie = `auth_token=${data.token}; path=/`;
			console.log("Token stored in cookie");

			// Verify token storage
			const localStorageToken = localStorage.getItem("auth_token");
			const sessionStorageToken = sessionStorage.getItem("auth_token");
			const cookieToken = document.cookie
				.split(";")
				.find((c) => c.trim().startsWith("auth_token="))
				?.split("=")[1];

			console.log("Token storage verification:", {
				hasLocalStorage: !!localStorageToken,
				hasSessionStorage: !!sessionStorageToken,
				hasCookie: !!cookieToken,
				rememberMe,
			});
		} catch (storageError) {
			console.error("Error storing token:", storageError);
		}

		return { data };
	} catch (error) {
		console.error("Sign in error:", error);
		return {
			error: {
				message: error instanceof Error ? error.message : "Failed to sign in",
			},
		};
	}
}

async function signUp(
	email: string,
	password: string,
	name: string,
): Promise<ApiResponse<SignUpResponse>> {
	try {
		const response = await fetch(`${API_BASE_URL}/api/v1/auth/sign-up`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email, password, name }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			return {
				error: {
					message: errorData.message || "Failed to create account",
				},
			};
		}

		const responseData = await response.json();
		console.log("Sign up response:", responseData);

		// Handle nested data structure
		const data = responseData.data || responseData;

		if (!data.token || !data.user) {
			return {
				error: {
					message: "Invalid response format from server",
				},
			};
		}

		return { data };
	} catch (error) {
		console.error("Sign up error:", error);
		return {
			error: {
				message: error instanceof Error ? error.message : "Failed to sign up",
			},
		};
	}
}

async function checkEmail(
	email: string,
): Promise<ApiResponse<CheckEmailResponse>> {
	try {
		const response = await fetch(`${API_BASE_URL}/api/v1/auth/check-email`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ email }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			return {
				error: {
					message: errorData.message || "Failed to check email",
				},
			};
		}

		const responseData = await response.json();
		console.log("Check email response:", responseData);

		// Handle nested data structure
		const exists = responseData.data?.exists;

		if (typeof exists !== "boolean") {
			console.error("Invalid response format:", responseData);
			return {
				error: {
					message: "Invalid response format from server",
				},
			};
		}

		return {
			data: {
				exists,
			},
		};
	} catch (error) {
		console.error("Check email error:", error);
		return {
			error: {
				message:
					error instanceof Error ? error.message : "Failed to check email",
			},
		};
	}
}

export { signIn, signUp, checkEmail, getProfile };
