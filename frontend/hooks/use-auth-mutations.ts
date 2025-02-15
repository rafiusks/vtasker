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

const shouldRetry = (error: unknown, retryCount: number): boolean => {
	// Only retry on network errors or 5xx server errors
	// Don't retry on 4xx client errors
	if (error instanceof Error && "code" in error) {
		const apiError = error as ApiError;
		const statusCode = Number.parseInt(apiError.code || "0");
		return (
			retryCount < RETRY_COUNT &&
			(apiError.code === "NETWORK_ERROR" || statusCode >= 500)
		);
	}
	return false;
};

export function useAuthMutations() {
	const { signIn: setAuthState } = useAuth();

	const checkEmailMutation = useMutation({
		mutationFn: async (email: string) => {
			return authApi.checkEmail(email);
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
			setAuthState(email, password, rememberMe);
			return response;
		},
		retry: shouldRetry,
		retryDelay: RETRY_DELAY,
		onError: (error: ApiError) => {
			const errorMessage = getErrorMessage(error);

			// Log specific error cases for monitoring
			switch (error.code as ErrorCode) {
				case "INVALID_CREDENTIALS":
				case "INVALID_PASSWORD":
					console.warn("Authentication failure:", errorMessage);
					break;
				case "ACCOUNT_LOCKED":
				case "ACCOUNT_DISABLED":
					console.error("Account access denied:", errorMessage);
					break;
				case "EMAIL_NOT_VERIFIED":
					console.warn("Unverified email attempt:", errorMessage);
					break;
				case "RATE_LIMIT_EXCEEDED":
					console.warn("Rate limit hit:", errorMessage);
					break;
				case "SESSION_EXPIRED":
				case "INVALID_TOKEN":
					console.warn("Session/token issue:", errorMessage);
					break;
				default:
					console.error("Sign in error:", errorMessage);
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
			const response = await authApi.signUp(email, password, name);
			setAuthState(email, password, true); // Always remember new registrations
			return response;
		},
		retry: shouldRetry,
		retryDelay: RETRY_DELAY,
		onError: (error: ApiError) => {
			const errorMessage = getErrorMessage(error);

			// Log specific error cases for monitoring
			switch (error.code as ErrorCode) {
				case "EMAIL_TAKEN":
					console.warn("Email conflict:", errorMessage);
					break;
				case "PASSWORD_TOO_WEAK":
					console.warn("Weak password attempt:", errorMessage);
					break;
				case "RATE_LIMIT_EXCEEDED":
					console.warn("Rate limit hit:", errorMessage);
					break;
				default:
					console.error("Sign up error:", errorMessage);
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
