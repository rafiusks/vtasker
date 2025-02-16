import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { createAuthSlice } from "./slices/auth";
import { createProjectSlice } from "./slices/project";
import type { AuthState, ProjectState } from "./types";

type StoreState = AuthState & ProjectState;

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

// Auth selectors
export const useUser = () => useStore((state) => state.user);
export const useIsAuthenticated = () =>
	useStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useStore((state) => state.isLoading);
export const useAuthError = () => useStore((state) => state.error);
export const useLogin = () => useStore((state) => state.login);
export const useLogout = () => useStore((state) => state.logout);
export const useClearAuthError = () => useStore((state) => state.clearError);

// Project selectors
export const useProjects = () => useStore((state) => state.projects);
export const useCurrentProject = () =>
	useStore((state) => state.currentProject);
export const useProjectsLoading = () =>
	useStore((state) => state.projectsLoading);
export const useProjectsError = () => useStore((state) => state.projectsError);
export const useFetchProjects = () => useStore((state) => state.fetchProjects);
export const useCreateProject = () => useStore((state) => state.createProject);
export const useUpdateProject = () => useStore((state) => state.updateProject);
export const useDeleteProject = () => useStore((state) => state.deleteProject);
export const useSetCurrentProject = () =>
	useStore((state) => state.setCurrentProject);
export const useClearProjectError = () =>
	useStore((state) => state.clearProjectError);
