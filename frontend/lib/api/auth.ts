import { apiRequest } from "./client";

interface CheckEmailResponse {
	exists: boolean;
}

interface SignInResponse {
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
	};
}

interface SignUpResponse {
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
	};
}

export async function checkEmail(email: string): Promise<CheckEmailResponse> {
	const response = await apiRequest<CheckEmailResponse>("/auth/check-email", {
		method: "POST",
		body: JSON.stringify({ email }),
	});
	return response.data;
}

export async function signIn(
	email: string,
	password: string,
): Promise<SignInResponse> {
	const response = await apiRequest<SignInResponse>("/auth/sign-in", {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});
	return response.data;
}

export async function signUp(
	email: string,
	password: string,
	name: string,
): Promise<SignUpResponse> {
	const response = await apiRequest<SignUpResponse>("/auth/sign-up", {
		method: "POST",
		body: JSON.stringify({ email, password, name }),
	});
	return response.data;
}
