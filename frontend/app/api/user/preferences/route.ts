import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
	// TODO: Get actual user preferences from backend
	// For now, return default preferences
	return NextResponse.json({
		theme: "light",
		notifications: {
			email: false,
			taskReminders: false,
			projectUpdates: false,
		},
	});
}

export async function PATCH(request: NextRequest) {
	try {
		const preferences = await request.json();
		// TODO: Update user preferences in backend
		return NextResponse.json(preferences);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to update preferences" },
			{ status: 400 },
		);
	}
}
