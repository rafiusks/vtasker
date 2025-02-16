import type { StateCreator } from "zustand";
import type { IssueState, Issue } from "../types";

const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	return "http://localhost:3000";
};

export const createIssueSlice: StateCreator<IssueState> = (set) => ({
	issues: [],
	currentIssue: null,
	isLoading: false,
	error: null,

	fetchIssues: async (projectId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await fetch(`/api/projects/${projectId}/issues`);
			if (!response.ok) {
				throw new Error("Failed to fetch issues");
			}

			const issues = await response.json();
			set({ issues, isLoading: false });
		} catch (error) {
			set({
				error:
					error instanceof Error ? error.message : "Failed to fetch issues",
				isLoading: false,
			});
		}
	},

	createIssue: async (issue) => {
		set({ isLoading: true, error: null });
		try {
			const response = await fetch(`/api/projects/${issue.projectId}/issues`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(issue),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to create issue");
			}

			set((state) => ({
				issues: [...state.issues, data],
				isLoading: false,
			}));

			return data;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to create issue";
			set({
				error: errorMessage,
				isLoading: false,
			});
			throw new Error(errorMessage);
		}
	},

	updateIssue: async (id, issue) => {
		set({ isLoading: true, error: null });
		try {
			const response = await fetch(`/api/issues/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(issue),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update issue");
			}

			set((state) => ({
				issues: state.issues.map((i) => (i.id === id ? { ...i, ...data } : i)),
				currentIssue:
					state.currentIssue?.id === id
						? { ...state.currentIssue, ...data }
						: state.currentIssue,
				isLoading: false,
			}));

			return data;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update issue";
			set({
				error: errorMessage,
				isLoading: false,
			});
			throw new Error(errorMessage);
		}
	},

	deleteIssue: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await fetch(`/api/issues/${id}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to delete issue");
			}

			set((state) => ({
				issues: state.issues.filter((i) => i.id !== id),
				currentIssue: state.currentIssue?.id === id ? null : state.currentIssue,
				isLoading: false,
			}));

			return data;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to delete issue";
			set({
				error: errorMessage,
				isLoading: false,
			});
			throw new Error(errorMessage);
		}
	},

	setCurrentIssue: (issue) => {
		set({ currentIssue: issue });
	},

	clearError: () => {
		set({ error: null });
	},
});
