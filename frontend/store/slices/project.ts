import type { StateCreator } from "zustand";
import type { ProjectState, Project } from "../types";
import { AUTH_TOKEN_KEY } from "@/lib/config";

export const createProjectSlice: StateCreator<ProjectState> = (set) => ({
	projects: [],
	currentProject: null,
	projectsLoading: false,
	projectsError: null,

	fetchProjects: async () => {
		set({ projectsLoading: true, projectsError: null });
		try {
			const token =
				localStorage.getItem(AUTH_TOKEN_KEY) ||
				sessionStorage.getItem(AUTH_TOKEN_KEY);
			const response = await fetch("/api/projects", {
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
			});
			if (!response.ok) {
				throw new Error("Failed to fetch projects");
			}

			const data = await response.json();
			set({
				projects: Array.isArray(data) ? data : [],
				projectsLoading: false,
			});
		} catch (error) {
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
			const token =
				localStorage.getItem(AUTH_TOKEN_KEY) ||
				sessionStorage.getItem(AUTH_TOKEN_KEY);
			const response = await fetch(`/api/projects/${id}`, {
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
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
			const token =
				localStorage.getItem(AUTH_TOKEN_KEY) ||
				sessionStorage.getItem(AUTH_TOKEN_KEY);
			const response = await fetch("/api/projects", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
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
			const token =
				localStorage.getItem(AUTH_TOKEN_KEY) ||
				sessionStorage.getItem(AUTH_TOKEN_KEY);
			const response = await fetch(`/api/projects/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
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
			const token =
				localStorage.getItem(AUTH_TOKEN_KEY) ||
				sessionStorage.getItem(AUTH_TOKEN_KEY);
			const response = await fetch(`/api/projects/${id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
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
