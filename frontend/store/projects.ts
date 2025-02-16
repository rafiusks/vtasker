import { create } from "zustand";
import type { Project } from "./types";

const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	return "http://localhost:3000";
};

interface ProjectsState {
	projects: Project[];
	setProjects: (projects: Project[]) => void;
	archiveProject: (id: string) => Promise<void>;
	deleteProject: (id: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
	projects: [],
	setProjects: (projects) => set({ projects }),
	archiveProject: async (id) => {
		const baseUrl = getBaseUrl();
		const response = await fetch(`${baseUrl}/api/projects/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ is_archived: true }),
		});

		if (!response.ok) {
			throw new Error("Failed to archive project");
		}

		set((state) => ({
			projects: state.projects.map((project) =>
				project.id === id ? { ...project, is_archived: true } : project,
			),
		}));
	},
	deleteProject: async (id) => {
		const baseUrl = getBaseUrl();
		const response = await fetch(`${baseUrl}/api/projects/${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			throw new Error("Failed to delete project");
		}

		set((state) => ({
			projects: state.projects.filter((project) => project.id !== id),
		}));
	},
}));
