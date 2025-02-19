import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Issue } from "@/store/types";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { searchParams } = new URL(request.url);
		const queryParams = new URLSearchParams();

		// Add project_id filter
		const { id: projectId } = await params;
		if (!projectId) {
			return NextResponse.json(
				{ error: "Project ID is required" },
				{ status: 400 },
			);
		}
		queryParams.append("project_id", projectId);

		// Add pagination
		const page = searchParams.get("page") || "1";
		const pageSize = searchParams.get("page_size") || "10";
		queryParams.append("page", page);
		queryParams.append("page_size", pageSize);

		// Add other filters if present
		const status = searchParams.get("status");
		if (status) queryParams.append("status", status);

		const priority = searchParams.get("priority");
		if (priority) queryParams.append("priority", priority);

		const search = searchParams.get("search");
		if (search) queryParams.append("search", search);

		const authHeader = request.headers.get("Authorization");
		if (!authHeader) {
			return NextResponse.json(
				{ error: "Authorization header is required" },
				{ status: 401 },
			);
		}

		try {
			const response = await fetch(
				`${baseUrl}/api/v1/issues?${queryParams.toString()}`,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: authHeader,
					},
					cache: "no-store",
				},
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.error || `HTTP error! status: ${response.status}`,
				);
			}

			const data = await response.json();
			return NextResponse.json(data);
		} catch (fetchError) {
			console.error("Error connecting to backend:", fetchError);
			return NextResponse.json(
				{
					error:
						"Unable to connect to the backend service. Please ensure the backend is running.",
				},
				{ status: 503 },
			);
		}
	} catch (error) {
		console.error("Error fetching issues:", error);
		return NextResponse.json(
			{ error: "Failed to fetch issues" },
			{ status: 500 },
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const projectId = params?.id;
		if (!projectId) {
			return NextResponse.json(
				{ error: "Project ID is required" },
				{ status: 400 },
			);
		}

		const body = await request.json();
		const authHeader = request.headers.get("Authorization");

		if (!authHeader) {
			return NextResponse.json(
				{ error: "Authorization header is required" },
				{ status: 401 },
			);
		}

		try {
			const response = await fetch(`${baseUrl}/api/v1/issues`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: authHeader,
				},
				body: JSON.stringify({
					...body,
					project_id: projectId,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.error || `HTTP error! status: ${response.status}`,
				);
			}

			const data = await response.json();
			return NextResponse.json(data, { status: 201 });
		} catch (fetchError) {
			console.error("Error connecting to backend:", fetchError);
			return NextResponse.json(
				{
					error:
						"Unable to connect to the backend service. Please ensure the backend is running.",
				},
				{ status: 503 },
			);
		}
	} catch (error) {
		console.error("Error creating issue:", error);
		return NextResponse.json(
			{ error: "Failed to create issue" },
			{ status: 500 },
		);
	}
}
