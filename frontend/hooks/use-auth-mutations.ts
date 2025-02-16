"use client";

import { useMutation } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";
import { useAuth } from "./use-auth";
import {
	type ApiError,
	getErrorMessage,
	type ErrorCode,
} from "@/lib/api/client";

// Retry configuration
const RETRY_COUNT = 2;
const RETRY_DELAY = 1000; // 1 second

const shouldRetry = (failureCount: number, error: ApiError): boolean => {
	// Only retry on network errors or 5xx server errors
	// Don't retry on 4xx client errors
	const statusCode = Number(error.code || "0");
	return (
		failureCount < RETRY_COUNT &&
		(error.code === "NETWORK_ERROR" || statusCode >= 500)
	);
};

export function useAuthMutations() {
	const auth = useAuth();

	const checkEmailMutation = useMutation({
		mutationFn: async (email: string) => {
			const response = await authApi.checkEmail(email);
			return response.data;
		},
		retry: shouldRetry,
		retryDelay: RETRY_DELAY,
		onError: (error: ApiError) => {
			console.error("Email check error:", getErrorMessage(error));
		},
	});

	const signInMutation = useMutation({
		mutationFn: async ({
			email,
			password,
			rememberMe,
		}: {
			email: string;
			password: string;
			rememberMe: boolean;
		}) => {
			const response = await authApi.signIn(email, password);
			
			// Handle both response structures
			const responseData = response.data ?? response;
			
			if (!responseData.token || !responseData.user) {
				const error = new Error("Missing token or user in response");
				(error as ApiError).code = "INVALID_RESPONSE";
				(error as ApiError).details = responseData;
				throw error;
			}

			// Type assertion for user data
			const user = responseData.user as User;
			
			// Store token and update state
			if (rememberMe) {
				localStorage.setItem("auth_token", responseData.token);
			} else {
				sessionStorage.setItem("auth_token", responseData.token);
			}
			
			auth.updateAuthState(user, rememberMe);
			return responseData;
		},
		retry: (failureCount: number, error: ApiError) => {
			const statusCode = Number(error.code);
			// Don't retry on account locked, invalid credentials, or user not found
			if (
				statusCode === 403 ||
				statusCode === 401 ||
				error.code === "USER_NOT_FOUND"
			) {
				return false;
			}
			return shouldRetry(failureCount, error);
		},
		retryDelay: RETRY_DELAY,
		onError: (error: ApiError) => {
			const errorMessage = getErrorMessage(error);
			const statusCode = Number(error.code || "0");

			// Log the full error object for debugging
			console.error("Sign in error:", error);

			// Handle the case where user doesn't exist
			if (error.code === "USER_NOT_FOUND") {
				console.warn("User not found:", errorMessage);
				error.message =
					"No account found with this email. Please sign up first.";
				return;
			}

			// Handle network errors
			if (error.code === "NETWORK_ERROR") {
				console.error("Network error:", errorMessage);
				error.message =
					"Unable to connect to the server. Please check your internet connection.";
				return;
			}

			// Handle invalid response
			if (error.code === "INVALID_RESPONSE") {
				error.message = "Received an invalid response from the server. Please try again.";
				return;
			}

			// Map HTTP status codes to error codes
			let errorCode: ErrorCode = error.code as ErrorCode;
			if (!errorCode && statusCode) {
				switch (statusCode) {
					case 403:
						errorCode = "ACCOUNT_LOCKED";
						break;
					case 401:
						errorCode = "INVALID_CREDENTIALS";
						break;
					case 429:
						errorCode = "RATE_LIMIT_EXCEEDED";
						break;
					default:
						errorCode = "SERVER_ERROR";
				}
			}

			// Log specific error cases for monitoring and return user-friendly messages
			switch (errorCode) {
				case "INVALID_CREDENTIALS":
				case "INVALID_PASSWORD":
					console.warn("Authentication failure:", errorMessage);
					error.message = "Invalid email or password. Please try again.";
					break;
				case "ACCOUNT_LOCKED":
					console.warn("Account locked:", errorMessage);
					error.message =
						"Your account has been locked. Please contact support.";
					break;
				case "ACCOUNT_DISABLED":
					console.warn("Account disabled:", errorMessage);
					error.message =
						"Your account has been disabled. Please contact support.";
					break;
				case "EMAIL_NOT_VERIFIED":
					console.warn("Unverified email attempt:", errorMessage);
					error.message = "Please verify your email address before signing in.";
					break;
				case "RATE_LIMIT_EXCEEDED":
					console.warn("Rate limit hit:", errorMessage);
					error.message = "Too many attempts. Please try again later.";
					break;
				case "SESSION_EXPIRED":
				case "INVALID_TOKEN":
					console.warn("Session/token issue:", errorMessage);
					error.message = "Your session has expired. Please sign in again.";
					break;
				default:
					console.error("Sign in error:", errorMessage);
					error.message = "An unexpected error occurred. Please try again.";
			}
		},
	});

	const signUpMutation = useMutation({
		mutationFn: async ({
			email,
			password,
			name,
		}: {
			email: string;
			password: string;
			name: string;
		}) => {
			return auth.signUp(email, password, name);
		},
		retry: shouldRetry,
		retryDelay: RETRY_DELAY,
		onError: (error: ApiError) => {
			const errorMessage = getErrorMessage(error);
			const statusCode = Number(error.code);

			// Map HTTP status codes and messages to error codes
			if (statusCode === 400) {
				if (errorMessage.includes("Password must be at least 8 characters")) {
					error.code = "PASSWORD_TOO_WEAK";
					error.message = "Password must be at least 8 characters long.";
				} else {
					error.code = "INVALID_REQUEST";
					error.message = "Please check your input and try again.";
				}
			} else if (statusCode === 409) {
				error.code = "EMAIL_TAKEN";
				error.message =
					"This email is already registered. Please sign in instead.";
			}

			// Log specific error cases for monitoring
			switch (error.code) {
				case "EMAIL_TAKEN":
					console.warn("Email conflict:", errorMessage);
					break;
				case "PASSWORD_TOO_WEAK":
					console.warn("Weak password attempt:", errorMessage);
					break;
				case "RATE_LIMIT_EXCEEDED":
					console.warn("Rate limit hit:", errorMessage);
					error.message = "Too many attempts. Please try again later.";
					break;
				case "INVALID_REQUEST":
					console.warn("Invalid signup request:", errorMessage);
					break;
				default:
					console.error("Sign up error:", errorMessage);
					error.message = "An unexpected error occurred. Please try again.";
			}
		},
	});

	return {
		checkEmail: {
			mutate: checkEmailMutation.mutate,
			mutateAsync: checkEmailMutation.mutateAsync,
			isPending: checkEmailMutation.isPending,
			error: checkEmailMutation.error as ApiError | null,
			errorMessage: checkEmailMutation.error
				? getErrorMessage(checkEmailMutation.error as ApiError)
				: null,
		},
		signIn: {
			mutate: signInMutation.mutate,
			mutateAsync: signInMutation.mutateAsync,
			isPending: signInMutation.isPending,
			error: signInMutation.error as ApiError | null,
			errorMessage: signInMutation.error
				? getErrorMessage(signInMutation.error as ApiError)
				: null,
		},
		signUp: {
			mutate: signUpMutation.mutate,
			mutateAsync: signUpMutation.mutateAsync,
			isPending: signUpMutation.isPending,
			error: signUpMutation.error as ApiError | null,
			errorMessage: signUpMutation.error
				? getErrorMessage(signUpMutation.error as ApiError)
				: null,
		},
	};
}
