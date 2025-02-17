import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDefaultHeaders } from "@/lib/config";

const getApiUrl = () => {
	// Use Docker service name for server-side requests
	return typeof window === "undefined"
		? "http://vtasker-backend:8080"
		: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
};

// Remove edge runtime, use default Node.js runtime
export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = await params;
		const apiUrl = getApiUrl();

		console.log("Fetching user profile:", {
			url: `${apiUrl}/api/v1/users/${id}`,
			headers: Object.fromEntries(request.headers.entries()),
		});

		const response = await fetch(`${apiUrl}/api/v1/users/${id}`, {
			method: "GET",
			headers: getDefaultHeaders(true, request.headers),
		});

		if (!response.ok) {
			const errorData = await response.json();
			return NextResponse.json(
				{ error: errorData.message || "Failed to fetch user" },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching user:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = await params;
		const apiUrl = getApiUrl();

		// Parse request body
		let body: { name?: string; email?: string };
		try {
			body = await request.json();
		} catch (error) {
			console.error("Failed to parse request body:", error);
			return NextResponse.json(
				{ error: "Invalid request body" },
				{ status: 400 },
			);
		}

		// Get headers
		const headers = getDefaultHeaders(true, request.headers);

		// Log request details
		console.log("API Route - Request details:", {
			method: request.method,
			url: request.url,
			id,
			apiUrl,
			body,
			headers: Object.fromEntries(request.headers.entries()),
			authHeader: headers.Authorization,
		});

		// Check authorization
		if (!headers.Authorization) {
			console.error("No authorization header");
			return NextResponse.json(
				{ error: "No authorization token provided" },
				{ status: 401 },
			);
		}

		// Make request to backend
		try {
			console.log("Making backend request to:", `${apiUrl}/api/v1/users/${id}`);

			const response = await fetch(`${apiUrl}/api/v1/users/${id}`, {
				method: "PATCH",
				headers: {
					...headers,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});

			// Log backend response
			console.log("API Route - Backend response:", {
				status: response.status,
				statusText: response.statusText,
				headers: Object.fromEntries(response.headers.entries()),
			});

			// Parse response
			interface ResponseData {
				message?: string;
				error?: string;
				[key: string]: unknown;
			}

			let responseData: ResponseData;
			const contentType = response.headers.get("content-type");

			if (contentType?.includes("application/json")) {
				try {
					responseData = await response.json();
				} catch (error) {
					console.error("Failed to parse JSON response:", error);
					return NextResponse.json(
						{ error: "Invalid response from server" },
						{ status: 500 },
					);
				}
			} else {
				const text = await response.text();
				console.error("Non-JSON response:", text);
				return NextResponse.json(
					{ error: "Invalid response format from server" },
					{ status: 500 },
				);
			}

			// Handle response
			if (!response.ok) {
				console.error("Backend request failed:", {
					status: response.status,
					data: responseData,
				});
				return NextResponse.json(
					{
						error:
							responseData.message || responseData.error || "Update failed",
					},
					{ status: response.status },
				);
			}

			return NextResponse.json(responseData);
		} catch (error) {
			console.error("Failed to make backend request:", {
				error,
				message: error instanceof Error ? error.message : "Unknown error",
				cause: error instanceof Error ? error.cause : undefined,
			});
			return NextResponse.json(
				{ error: "Failed to communicate with server" },
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error("Unhandled error in PATCH handler:", error);
		return NextResponse.json(
			{
				error: "Internal server error",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
