"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useProjectsStore } from "@/store/projects";
import type { Project } from "@/store/types";
import { Button } from "@/components/ui/button";
import { ProjectDashboard } from "./project-dashboard";
import { Archive, Trash2 } from "lucide-react";

interface ProjectDetailsProps {
	initialProject: Project;
}

export function ProjectDetails({ initialProject }: ProjectDetailsProps) {
	const router = useRouter();
	const { projects, setProjects, archiveProject, deleteProject } =
		useProjectsStore();

	React.useEffect(() => {
		if (initialProject) {
			setProjects([initialProject]);
		}
	}, [initialProject, setProjects]);

	const project = projects[0];

	if (!project) {
		return null;
	}

	const handleArchive = async () => {
		await archiveProject(project.id);
		router.push("/projects");
	};

	const handleDelete = async () => {
		await deleteProject(project.id);
		router.push("/projects");
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						size="icon"
						onClick={handleArchive}
						title="Archive project"
					>
						<Archive className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={handleDelete}
						title="Delete project"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>
			<ProjectDashboard project={project} />
		</div>
	);
}
