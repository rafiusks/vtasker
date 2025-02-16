import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Project } from "@/store/types";

// Mock data for development
const mockProjects: Project[] = [
	{
		id: "1",
		name: "Website Redesign",
		description:
			"Complete overhaul of the company website with modern design and improved UX.",
		is_archived: false,
		createdAt: "2024-01-15T10:00:00Z",
		updatedAt: "2024-01-15T10:00:00Z",
	},
	{
		id: "2",
		name: "Mobile App Development",
		description: "Build a new mobile app for both iOS and Android platforms.",
		is_archived: false,
		createdAt: "2024-01-20T14:30:00Z",
		updatedAt: "2024-01-20T14:30:00Z",
	},
	{
		id: "3",
		name: "Marketing Campaign",
		description: "Q1 2024 digital marketing campaign across multiple channels.",
		is_archived: false,
		createdAt: "2024-02-01T09:15:00Z",
		updatedAt: "2024-02-01T09:15:00Z",
	},
];

// Export for use in [id] route
export const projectsStore = {
	data: [...mockProjects] as Project[],
};

export async function GET() {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	return NextResponse.json(projectsStore.data);
}

export async function POST(request: NextRequest) {
	try {
		const data = await request.json();

		// Validate required fields
		if (!data.name) {
			return NextResponse.json(
				{ error: "Project name is required" },
				{ status: 400 },
			);
		}

		// Create new project
		const newProject: Project = {
			id: Math.random().toString(36).substr(2, 9),
			name: data.name,
			description: data.description || "",
			is_archived: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		projectsStore.data.push(newProject);

		return NextResponse.json(newProject);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to create project" },
			{ status: 400 },
		);
	}
}
