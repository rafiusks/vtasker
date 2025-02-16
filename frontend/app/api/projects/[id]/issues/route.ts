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
		queryParams.append("project_id", params.id);

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

		const response = await fetch(
			`${baseUrl}/api/v1/issues?${queryParams.toString()}`,
		);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		return NextResponse.json(data);
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
		const body = await request.json();
		const response = await fetch(`${baseUrl}/api/v1/issues`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				...body,
				project_id: params.id,
			}),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error("Error creating issue:", error);
		return NextResponse.json(
			{ error: "Failed to create issue" },
			{ status: 500 },
		);
	}
}
