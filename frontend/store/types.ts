/**
 * Store Types
 */

// User types
export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
}

// Project types
export interface Project {
	id: string;
	name: string;
	description: string;
	is_archived: boolean;
	createdAt: string;
	updatedAt: string;
}

// Issue types
export interface Issue {
	id: string;
	title: string;
	description: string;
	status: "todo" | "in_progress" | "in_review" | "done";
	priority: "low" | "medium" | "high";
	assigneeId?: string;
	projectId: string;
	createdAt: string;
	updatedAt: string;
}

// Auth state
export interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	clearError: () => void;
}

// Project state
export interface ProjectState {
	projects: Project[];
	currentProject: Project | null;
	projectsLoading: boolean;
	projectsError: string | null;
	fetchProjects: () => Promise<void>;
	createProject: (
		project: Omit<Project, "id" | "createdAt" | "updatedAt">,
	) => Promise<void>;
	updateProject: (id: string, project: Partial<Project>) => Promise<void>;
	deleteProject: (id: string) => Promise<void>;
	setCurrentProject: (project: Project | null) => void;
	clearProjectError: () => void;
}

// Issue state
export interface IssueState {
	issues: Issue[];
	currentIssue: Issue | null;
	isLoading: boolean;
	error: string | null;
	fetchIssues: (projectId: string) => Promise<void>;
	createIssue: (
		issue: Omit<Issue, "id" | "createdAt" | "updatedAt">,
	) => Promise<void>;
	updateIssue: (id: string, issue: Partial<Issue>) => Promise<void>;
	deleteIssue: (id: string) => Promise<void>;
	setCurrentIssue: (issue: Issue | null) => void;
	clearError: () => void;
}
