import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createAuthSlice } from "./slices/auth";
import { createProjectSlice } from "./slices/project";
import type { AuthState, ProjectState } from "./types";

interface StoreState extends AuthState, ProjectState {}

export const useStore = create<StoreState>()(
	devtools(
		persist(
			(...a) => ({
				...createAuthSlice(...a),
				...createProjectSlice(...a),
			}),
			{
				name: "vtasker-store",
				partialize: (state) => ({
					user: state.user,
					isAuthenticated: state.isAuthenticated,
					projects: state.projects,
					currentProject: state.currentProject,
				}),
			},
		),
	),
);

// Selector hooks for better performance
export const useAuth = () =>
	useStore((state) => ({
		user: state.user,
		isAuthenticated: state.isAuthenticated,
		isLoading: state.isLoading,
		error: state.error,
		login: state.login,
		logout: state.logout,
		clearError: state.clearError,
	}));

export const useProjects = () =>
	useStore((state) => ({
		projects: state.projects,
		currentProject: state.currentProject,
		isLoading: state.isLoading,
		error: state.error,
		fetchProjects: state.fetchProjects,
		createProject: state.createProject,
		updateProject: state.updateProject,
		deleteProject: state.deleteProject,
		setCurrentProject: state.setCurrentProject,
		clearError: state.clearError,
	}));
