// Status constants
export const IssueStatus = {
	TODO: "todo",
	IN_PROGRESS: "in_progress",
	IN_REVIEW: "in_review",
	DONE: "done",
} as const;

export type IssueStatus = (typeof IssueStatus)[keyof typeof IssueStatus];

// Priority constants
export const IssuePriority = {
	LOW: "low",
	MEDIUM: "medium",
	HIGH: "high",
} as const;

export type IssuePriority = (typeof IssuePriority)[keyof typeof IssuePriority];

export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Project {
	id: string;
	name: string;
	description: string;
	is_archived: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Issue {
	id: string;
	title: string;
	description: string;
	status: IssueStatus;
	priority: IssuePriority;
	projectId: string;
	assigneeId?: string;
	createdBy: string;
	isArchived: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface IssueResponse extends Issue {
	projectName: string;
	assigneeName?: string;
}

export interface IssueListResponse {
	items: IssueResponse[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface IssueFilter {
	projectId?: string;
	status?: IssueStatus;
	priority?: IssuePriority;
	assigneeId?: string;
	search?: string;
}

export interface CreateIssueRequest {
	title: string;
	description: string;
	priority: IssuePriority;
	projectId: string;
	assigneeId?: string;
}

export interface UpdateIssueRequest {
	title?: string;
	description?: string;
	status?: IssueStatus;
	priority?: IssuePriority;
	assigneeId?: string;
}
