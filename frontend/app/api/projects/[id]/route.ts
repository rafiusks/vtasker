import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Project } from "@/store/types";
import { getDefaultHeaders } from "@/lib/config";

const getApiUrl = () => {
	// Use Docker service name for server-side requests
	return typeof window === "undefined"
		? "http://vtasker-backend:8080"
		: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
};

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> | { id: string } },
) {
	try {
		const { id } = await params;
		const apiUrl = getApiUrl();

		// Log incoming request headers for debugging
		console.log("Incoming request headers:", {
			authorization: request.headers.get("authorization"),
			cookie: request.headers.get("cookie"),
		});

		const res = await fetch(`${apiUrl}/api/v1/projects/${id}`, {
			method: "GET",
			headers: getDefaultHeaders(true, request.headers),
		});

		if (!res.ok) {
			let errorMessage = "Failed to fetch project";
			const contentType = res.headers.get("content-type");

			if (contentType?.includes("application/json")) {
				const error = await res.json();
				errorMessage = error.message || errorMessage;
			} else {
				const text = await res.text();
				errorMessage = text || errorMessage;
			}

			return NextResponse.json({ error: errorMessage }, { status: res.status });
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching project:", error);
		return NextResponse.json(
			{ error: "Failed to fetch project" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> | { id: string } },
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const apiUrl = getApiUrl();

		// Log incoming request headers for debugging
		console.log("Incoming request headers:", {
			authorization: request.headers.get("authorization"),
			cookie: request.headers.get("cookie"),
		});

		const res = await fetch(`${apiUrl}/api/v1/projects/${id}`, {
			method: "PATCH",
			headers: getDefaultHeaders(true, request.headers),
			body: JSON.stringify(body),
		});

		if (!res.ok) {
			let errorMessage = "Failed to update project";
			const contentType = res.headers.get("content-type");

			if (contentType?.includes("application/json")) {
				const error = await res.json();
				errorMessage = error.message || errorMessage;
			} else {
				const text = await res.text();
				errorMessage = text || errorMessage;
			}

			return NextResponse.json({ error: errorMessage }, { status: res.status });
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error updating project:", error);
		return NextResponse.json(
			{ error: "Failed to update project" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> | { id: string } },
) {
	try {
		const { id } = await params;
		const apiUrl = getApiUrl();

		console.log("Delete project request headers:", {
			authorization: request.headers.get("authorization"),
			cookie: request.headers.get("cookie"),
			allHeaders: Object.fromEntries(request.headers.entries()),
		});

		// Get auth token from headers and cookies
		const headers = getDefaultHeaders(true, request.headers);

		// If no auth token found, return unauthorized
		if (!headers.Authorization) {
			console.error("No authorization token found in headers:", {
				headers: Object.keys(headers),
				requestHeaders: Object.fromEntries(request.headers.entries()),
				cookies: request.cookies.getAll(),
			});
			return NextResponse.json(
				{ error: "Unauthorized - No token provided" },
				{ status: 401 },
			);
		}

		console.log("Making backend request with headers:", {
			hasAuth: !!headers.Authorization,
			url: `${apiUrl}/api/v1/projects/${id}`,
		});

		const res = await fetch(`${apiUrl}/api/v1/projects/${id}`, {
			method: "DELETE",
			headers,
			credentials: "include",
		});

		if (!res.ok) {
			let errorMessage = "Failed to delete project";
			const contentType = res.headers.get("content-type");

			if (contentType?.includes("application/json")) {
				const error = await res.json();
				errorMessage = error.message || error.error || errorMessage;
			} else {
				const text = await res.text();
				errorMessage = text || errorMessage;
			}

			console.error("Delete project error:", {
				status: res.status,
				message: errorMessage,
				headers: Object.fromEntries(res.headers.entries()),
				responseHeaders: Object.fromEntries(res.headers.entries()),
			});

			return NextResponse.json({ error: errorMessage }, { status: res.status });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting project:", error);
		return NextResponse.json(
			{ error: "Failed to delete project" },
			{ status: 500 },
		);
	}
}
