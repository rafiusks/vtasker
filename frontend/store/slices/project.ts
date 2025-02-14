import { StateCreator } from "zustand";
import { ProjectState, Project } from "../types";

export const createProjectSlice: StateCreator<ProjectState> = (set) => ({
	projects: [],
	currentProject: null,
	isLoading: false,
	error: null,

	fetchProjects: async () => {
		set({ isLoading: true, error: null });
		try {
			// TODO: Implement actual API call
			const response = await fetch("/api/projects");
			if (!response.ok) {
				throw new Error("Failed to fetch projects");
			}

			const projects = await response.json();
			set({ projects, isLoading: false });
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : "Failed to fetch projects",
				isLoading: false,
			});
		}
	},

	createProject: async (project) => {
		set({ isLoading: true, error: null });
		try {
			// TODO: Implement actual API call
			const response = await fetch("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(project),
			});

			if (!response.ok) {
				throw new Error("Failed to create project");
			}

			const newProject = await response.json();
			set((state) => ({
				projects: [...state.projects, newProject],
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : "Failed to create project",
				isLoading: false,
			});
		}
	},

	updateProject: async (id, project) => {
		set({ isLoading: true, error: null });
		try {
			// TODO: Implement actual API call
			const response = await fetch(`/api/projects/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(project),
			});

			if (!response.ok) {
				throw new Error("Failed to update project");
			}

			const updatedProject = await response.json();
			set((state) => ({
				projects: state.projects.map((p) =>
					p.id === id ? { ...p, ...updatedProject } : p,
				),
				currentProject:
					state.currentProject?.id === id
						? { ...state.currentProject, ...updatedProject }
						: state.currentProject,
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : "Failed to update project",
				isLoading: false,
			});
		}
	},

	deleteProject: async (id) => {
		set({ isLoading: true, error: null });
		try {
			// TODO: Implement actual API call
			const response = await fetch(`/api/projects/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete project");
			}

			set((state) => ({
				projects: state.projects.filter((p) => p.id !== id),
				currentProject:
					state.currentProject?.id === id ? null : state.currentProject,
				isLoading: false,
			}));
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : "Failed to delete project",
				isLoading: false,
			});
		}
	},

	setCurrentProject: (project) => {
		set({ currentProject: project });
	},

	clearError: () => {
		set({ error: null });
	},
});
