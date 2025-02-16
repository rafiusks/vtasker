const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function fetchWithAuth(url: string, options: RequestInit = {}) {
	const token =
		typeof window !== "undefined" ? localStorage.getItem("token") : null;

	const headers = {
		"Content-Type": "application/json",
		...(token && { Authorization: `Bearer ${token}` }),
		...options.headers,
	};

	const response = await fetch(`${BASE_URL}${url}`, {
		...options,
		headers,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.message || "An error occurred");
	}

	return response.json();
}

export const api = {
	get: (url: string, options: RequestInit = {}) =>
		fetchWithAuth(url, { ...options, method: "GET" }),

	post: (url: string, data: unknown, options: RequestInit = {}) =>
		fetchWithAuth(url, {
			...options,
			method: "POST",
			body: JSON.stringify(data),
		}),

	patch: (url: string, data: unknown, options: RequestInit = {}) =>
		fetchWithAuth(url, {
			...options,
			method: "PATCH",
			body: JSON.stringify(data),
		}),

	delete: (url: string, options: RequestInit = {}) =>
		fetchWithAuth(url, { ...options, method: "DELETE" }),
};
