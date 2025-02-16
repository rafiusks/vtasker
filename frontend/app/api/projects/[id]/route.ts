import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Project } from "@/store/types";
import { projectsStore } from "../route";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const project = projectsStore.data.find((p) => p.id === params.id);

	if (!project) {
		return NextResponse.json({ error: "Project not found" }, { status: 404 });
	}

	return NextResponse.json(project);
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const data = await request.json();
		const index = projectsStore.data.findIndex((p) => p.id === params.id);

		if (index === -1) {
			return NextResponse.json({ error: "Project not found" }, { status: 404 });
		}

		// Update project
		const updatedProject: Project = {
			...projectsStore.data[index],
			...data,
			updatedAt: new Date().toISOString(),
		};

		projectsStore.data[index] = updatedProject;

		return NextResponse.json(updatedProject);
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to update project" },
			{ status: 400 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const index = projectsStore.data.findIndex((p) => p.id === params.id);

	if (index === -1) {
		return NextResponse.json({ error: "Project not found" }, { status: 404 });
	}

	// In a real app, we might want to archive instead of delete
	projectsStore.data = projectsStore.data.filter((p) => p.id !== params.id);

	return NextResponse.json({ success: true });
}
