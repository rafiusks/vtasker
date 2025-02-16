import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Project } from "@/store/types";
import {
	ENDPOINTS,
	getEndpointUrl,
	buildQueryParams,
	getDefaultHeaders,
	DEFAULT_PAGE_SIZE,
} from "@/lib/config";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const params = {
			page: searchParams.get("page") ?? undefined,
			page_size: searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE,
			search: searchParams.get("search") ?? undefined,
		};

		const url = getEndpointUrl(
			`${ENDPOINTS.PROJECTS.BASE}?${buildQueryParams(params)}`,
		);
		console.log("Fetching projects from:", url);

		// Log incoming request headers
		console.log("Incoming request headers:", {
			authorization: request.headers.get("authorization"),
			cookie: request.headers.get("cookie"),
		});

		// Get the auth token from the request headers
		const authHeader = request.headers.get("authorization");

		// Forward the auth token to the backend
		const headers = {
			"Content-Type": "application/json",
			...(authHeader ? { Authorization: authHeader } : {}),
		};

		// Log outgoing request headers
		console.log("Outgoing request headers:", headers);

		const response = await fetch(url, {
			method: "GET",
			headers,
			cache: "no-store",
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Backend response error:", {
				status: response.status,
				statusText: response.statusText,
				body: errorText,
			});
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching projects:", {
			error,
			message: error instanceof Error ? error.message : "Unknown error",
			cause: error instanceof Error ? error.cause : undefined,
		});

		return NextResponse.json(
			{ error: "Failed to fetch projects" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		if (!body.name) {
			return NextResponse.json(
				{ error: "Project name is required" },
				{ status: 400 },
			);
		}

		const response = await fetch(getEndpointUrl(ENDPOINTS.PROJECTS.BASE), {
			method: "POST",
			headers: getDefaultHeaders(true, request.headers),
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			let errorMessage = "Failed to create project";
			const contentType = response.headers.get("content-type");

			if (contentType?.includes("application/json")) {
				const error = await response.json();
				errorMessage = error.message || errorMessage;
			} else {
				const text = await response.text();
				errorMessage = text || errorMessage;
			}

			return NextResponse.json(
				{ error: errorMessage },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error creating project:", error);
		return NextResponse.json(
			{ error: "Failed to create project" },
			{ status: 500 },
		);
	}
}
