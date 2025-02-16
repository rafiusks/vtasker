import type { StateCreator } from "zustand";
import type { ProjectState, Project } from "../types";

export const createProjectSlice: StateCreator<ProjectState> = (set) => ({
	projects: [],
	currentProject: null,
	projectsLoading: false,
	projectsError: null,

	fetchProjects: async () => {
		set({ projectsLoading: true, projectsError: null });
		try {
			// TODO: Implement actual API call
			const response = await fetch("/api/projects");
			if (!response.ok) {
				throw new Error("Failed to fetch projects");
			}

			const projects = await response.json();
			set({ projects, projectsLoading: false });
		} catch (error) {
			set({
				projectsError:
					error instanceof Error ? error.message : "Failed to fetch projects",
				projectsLoading: false,
			});
		}
	},

	createProject: async (project) => {
		set({ projectsLoading: true, projectsError: null });
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
				projectsLoading: false,
			}));
		} catch (error) {
			set({
				projectsError:
					error instanceof Error ? error.message : "Failed to create project",
				projectsLoading: false,
			});
		}
	},

	updateProject: async (id, project) => {
		set({ projectsLoading: true, projectsError: null });
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
				projectsLoading: false,
			}));
		} catch (error) {
			set({
				projectsError:
					error instanceof Error ? error.message : "Failed to update project",
				projectsLoading: false,
			});
		}
	},

	deleteProject: async (id) => {
		set({ projectsLoading: true, projectsError: null });
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
				projectsLoading: false,
			}));
		} catch (error) {
			set({
				projectsError:
					error instanceof Error ? error.message : "Failed to delete project",
				projectsLoading: false,
			});
		}
	},

	setCurrentProject: (project) => {
		set({ currentProject: project });
	},

	clearProjectError: () => {
		set({ projectsError: null });
	},
});
