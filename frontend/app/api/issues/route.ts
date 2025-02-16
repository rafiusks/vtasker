import { NextResponse } from "next/server";
import type { Issue } from "@/types";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const status = searchParams.get("status");
	const priority = searchParams.get("priority");
	const projectId = searchParams.get("project_id");
	const assigneeId = searchParams.get("assignee_id");
	const page = Number.parseInt(searchParams.get("page") || "1", 10);
	const limit = Number.parseInt(searchParams.get("limit") || "10", 10);

	try {
		const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
		const queryParams = new URLSearchParams();

		if (status) queryParams.append("status", status);
		if (priority) queryParams.append("priority", priority);
		if (projectId) queryParams.append("project_id", projectId);
		if (assigneeId) queryParams.append("assignee_id", assigneeId);
		queryParams.append("page", page.toString());
		queryParams.append("limit", limit.toString());

		const response = await fetch(
			`${baseUrl}/api/v1/issues?${queryParams.toString()}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			throw new Error("Failed to fetch issues from backend");
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

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

		const response = await fetch(`${baseUrl}/api/v1/issues`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const error = await response.json();
			return NextResponse.json(
				{ error: error.message || "Failed to create issue" },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error creating issue:", error);
		return NextResponse.json(
			{ error: "Failed to create issue" },
			{ status: 500 },
		);
	}
}

export async function PATCH(request: Request) {
	try {
		const body = await request.json();
		const { id } = body;
		const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

		const response = await fetch(`${baseUrl}/api/issues/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const error = await response.json();
			return NextResponse.json(
				{ error: error.message || "Failed to update issue" },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error updating issue:", error);
		return NextResponse.json(
			{ error: "Failed to update issue" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ error: "Issue ID is required" },
				{ status: 400 },
			);
		}

		const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
		const response = await fetch(`${baseUrl}/api/issues/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const error = await response.json();
			return NextResponse.json(
				{ error: error.message || "Failed to delete issue" },
				{ status: response.status },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting issue:", error);
		return NextResponse.json(
			{ error: "Failed to delete issue" },
			{ status: 500 },
		);
	}
}
