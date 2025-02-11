declare global {
	interface ImportMetaEnv {
		readonly VITE_API_URL: string;
	}
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Shared headers between all API instances
const sharedHeaders: Record<string, string | undefined> = {
	"Content-Type": "application/json",
};

export class BaseAPI {
	protected async request<T>(
		endpoint: string,
		options: RequestInit = {},
	): Promise<T> {
		console.log("Making request to:", API_URL + endpoint);

		// Create clean headers object without undefined values
		const headers: Record<string, string> = {};
		for (const [key, value] of Object.entries(sharedHeaders)) {
			if (value !== undefined) {
				headers[key] = value;
			}
		}

		try {
			const response = await fetch(`${API_URL}${endpoint}`, {
				...options,
				headers: {
					...headers,
					...options.headers,
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					localStorage.removeItem("token");
					window.location.href = "/login";
					throw new Error("Unauthorized");
				}

				const data = await response.json().catch(() => null);
				throw new Error(
					data?.message ||
						data?.error ||
						`HTTP error! status: ${response.status}`,
				);
			}

			if (response.status === 204) {
				return undefined as T;
			}

			return response.json();
		} catch (error) {
			console.error("API request failed:", {
				endpoint,
				error,
				headers,
				options,
			});
			throw error;
		}
	}

	setAuthHeader(value: string): void {
		console.log("Setting auth header:", value);
		sharedHeaders.Authorization = value;
	}

	removeAuthHeader(): void {
		console.log("Removing auth header");
		sharedHeaders.Authorization = undefined;
	}
}
