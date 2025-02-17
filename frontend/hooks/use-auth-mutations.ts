"use client";

import { useMutation } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";
import { useAuth } from "./use-auth";
import {
	type ApiError,
	getErrorMessage,
	type ErrorCode,
} from "@/lib/api/client";
import type { User } from "@/store/types";

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

	const checkEmail = useMutation({
		mutationFn: async (email: string) => {
			const response = await authApi.checkEmail(email);
			return response;
		},
	});

	const signIn = useMutation({
		mutationFn: async ({
			email,
			password,
			rememberMe,
		}: {
			email: string;
			password: string;
			rememberMe: boolean;
		}) => {
			const response = await authApi.signIn(email, password, rememberMe);

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (!response.data?.token || !response.data?.user) {
				throw new Error("Missing token or user in response");
			}

			// Store token and update state
			if (rememberMe) {
				localStorage.setItem("auth_token", response.data.token);
			} else {
				sessionStorage.setItem("auth_token", response.data.token);
			}

			// Set the token in the cookie for API requests
			document.cookie = `auth_token=${response.data.token}; path=/`;

			auth.updateAuthState(response.data.user, rememberMe);
			return response;
		},
	});

	const signUp = useMutation({
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

			if (response.error) {
				throw new Error(response.error.message);
			}

			if (!response.data?.token || !response.data?.user) {
				throw new Error("Missing token or user in response");
			}

			// For new registrations, store the token in localStorage
			localStorage.setItem("auth_token", response.data.token);
			// Set the token in the cookie for API requests
			document.cookie = `auth_token=${response.data.token}; path=/`;

			auth.updateAuthState(response.data.user);
			return response;
		},
	});

	return {
		checkEmail,
		signIn,
		signUp,
	};
}
