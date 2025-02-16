import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ENDPOINTS, getEndpointUrl, getDefaultHeaders } from "@/lib/config";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		if (!body.email || !body.password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 },
			);
		}

		const response = await fetch(getEndpointUrl(ENDPOINTS.AUTH.SIGN_IN), {
			method: "POST",
			headers: getDefaultHeaders(false), // Don't include auth header for sign in
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			let errorMessage = "Invalid credentials";
			const contentType = response.headers.get("content-type");

			if (contentType?.includes("application/json")) {
				const error = await response.json();
				errorMessage = error.message || errorMessage;
			}

			return NextResponse.json(
				{ error: errorMessage },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error during sign in:", error);
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 500 },
		);
	}
}
