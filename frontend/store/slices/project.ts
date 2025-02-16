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
			const response = await fetch("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(project),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create project");
			}

			set((state) => ({
				projects: [...state.projects, data],
				projectsLoading: false,
			}));

			return data;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to create project";
			set({
				projectsError: errorMessage,
				projectsLoading: false,
			});
			throw new Error(errorMessage);
		}
	},

	updateProject: async (id, project) => {
		set({ projectsLoading: true, projectsError: null });
		try {
			const response = await fetch(`/api/projects/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(project),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update project");
			}

			set((state) => ({
				projects: state.projects.map((p) =>
					p.id === id ? { ...p, ...data } : p,
				),
				currentProject:
					state.currentProject?.id === id
						? { ...state.currentProject, ...data }
						: state.currentProject,
				projectsLoading: false,
			}));

			return data;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update project";
			set({
				projectsError: errorMessage,
				projectsLoading: false,
			});
			throw new Error(errorMessage);
		}
	},

	deleteProject: async (id) => {
		set({ projectsLoading: true, projectsError: null });
		try {
			const response = await fetch(`/api/projects/${id}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to delete project");
			}

			set((state) => ({
				projects: state.projects.filter((p) => p.id !== id),
				currentProject:
					state.currentProject?.id === id ? null : state.currentProject,
				projectsLoading: false,
			}));

			return data;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to delete project";
			set({
				projectsError: errorMessage,
				projectsLoading: false,
			});
			throw new Error(errorMessage);
		}
	},

	setCurrentProject: (project) => {
		set({ currentProject: project });
	},

	clearProjectError: () => {
		set({ projectsError: null });
	},
});
