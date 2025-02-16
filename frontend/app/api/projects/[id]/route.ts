import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Project } from "@/store/types";
import { projectsStore } from "../route";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> | { id: string } },
) {
	try {
		const { id } = await params;
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
		const res = await fetch(`${apiUrl}/api/projects/${id}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
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
	request: Request,
	{ params }: { params: Promise<{ id: string }> | { id: string } },
) {
	try {
		const { id } = await params;
		const body = await request.json();
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

		const res = await fetch(`${apiUrl}/api/projects/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
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
	request: Request,
	{ params }: { params: Promise<{ id: string }> | { id: string } },
) {
	try {
		const { id } = await params;
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

		const res = await fetch(`${apiUrl}/api/projects/${id}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!res.ok) {
			let errorMessage = "Failed to delete project";
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

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting project:", error);
		return NextResponse.json(
			{ error: "Failed to delete project" },
			{ status: 500 },
		);
	}
}
