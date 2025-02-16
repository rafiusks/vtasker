import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ENDPOINTS, getEndpointUrl, getDefaultHeaders } from "@/lib/config";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		if (!body.email) {
			return NextResponse.json({ error: "Email is required" }, { status: 400 });
		}

		// Log the request details for debugging
		console.log("Checking email:", {
			email: body.email,
			endpoint: getEndpointUrl(ENDPOINTS.AUTH.CHECK_EMAIL),
		});

		const response = await fetch(getEndpointUrl(ENDPOINTS.AUTH.CHECK_EMAIL), {
			method: "POST",
			headers: {
				...getDefaultHeaders(false), // Don't include auth header for email check
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		// Log the response status for debugging
		console.log("Email check response:", {
			status: response.status,
			ok: response.ok,
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Email check error:", {
				status: response.status,
				error: errorText,
			});
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error checking email:", error);
		return NextResponse.json(
			{ error: "Failed to check email" },
			{ status: 500 },
		);
	}
}
