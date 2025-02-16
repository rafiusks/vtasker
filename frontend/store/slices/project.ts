import type { StateCreator } from "zustand";
import type { ProjectState, Project } from "../types";
import { getDefaultHeaders } from "@/lib/config";

export const createProjectSlice: StateCreator<ProjectState> = (set) => ({
	projects: [],
	currentProject: null,
	projectsLoading: false,
	projectsError: null,

	fetchProjects: async () => {
		set({ projectsLoading: true, projectsError: null });
		try {
			const response = await fetch("/api/projects", {
				headers: getDefaultHeaders(true),
			});
			if (!response.ok) {
				throw new Error("Failed to fetch projects");
			}

			const data = await response.json();
			console.log("Store received data:", data);
			set({
				projects: data.projects || [], // Extract projects from the paginated response
				projectsLoading: false,
			});
		} catch (error) {
			console.error("Store fetch error:", error);
			set({
				projectsError:
					error instanceof Error ? error.message : "Failed to fetch projects",
				projectsLoading: false,
				projects: [], // Ensure projects is always an array even on error
			});
		}
	},

	fetchProject: async (id: string) => {
		set({ projectsLoading: true, projectsError: null });
		try {
			const response = await fetch(`/api/projects/${id}`, {
				headers: getDefaultHeaders(true),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch project");
			}

			set((state) => ({
				currentProject: data,
				projectsLoading: false,
			}));

			return data;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to fetch project";
			set({
				projectsError: errorMessage,
				projectsLoading: false,
			});
			throw new Error(errorMessage);
		}
	},

	createProject: async (project) => {
		set({ projectsLoading: true, projectsError: null });
		try {
			const response = await fetch("/api/projects", {
				method: "POST",
				headers: getDefaultHeaders(true),
				body: JSON.stringify(project),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create project");
			}

			set((state) => ({
				projects: Array.isArray(state.projects)
					? [...state.projects, data]
					: [data],
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
				headers: getDefaultHeaders(true),
				body: JSON.stringify(project),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update project");
			}

			set((state) => ({
				projects: Array.isArray(state.projects)
					? state.projects.map((p) => (p.id === id ? { ...p, ...data } : p))
					: [data],
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
				headers: getDefaultHeaders(true),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to delete project");
			}

			set((state) => ({
				projects: Array.isArray(state.projects)
					? state.projects.filter((p) => p.id !== id)
					: [],
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
