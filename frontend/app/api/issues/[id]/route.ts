import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const response = await fetch(`${baseUrl}/api/v1/issues/${params.id}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching issue:", error);
		return NextResponse.json(
			{ error: "Failed to fetch issue" },
			{ status: 500 },
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const body = await request.json();
		const response = await fetch(`${baseUrl}/api/v1/issues/${params.id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
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

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const response = await fetch(`${baseUrl}/api/v1/issues/${params.id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("Error deleting issue:", error);
		return NextResponse.json(
			{ error: "Failed to delete issue" },
			{ status: 500 },
		);
	}
}
