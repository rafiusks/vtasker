"use client";

import { useQuery } from "@tanstack/react-query";
import type { Project, Issue, IssueListResponse } from "@/types";
import { IssuesList } from "@/components/issues/issues-list";
import { Skeleton } from "@/components/ui/skeleton";

async function getProjectIssues(projectId: string): Promise<Issue[]> {
	if (!projectId) {
		throw new Error("Project ID is required");
	}

	const res = await fetch(`/api/projects/${projectId}/issues`, {
		method: "GET",
		cache: "no-store",
	});

	if (!res.ok) {
		const contentType = res.headers.get("content-type");
		let errorMessage = "Failed to fetch project issues";

		if (contentType?.includes("application/json")) {
			const error = await res.json();
			errorMessage = error.error || error.message || errorMessage;
		} else {
			const text = await res.text();
			errorMessage = text || errorMessage;
		}

		throw new Error(errorMessage);
	}

	const data = await res.json();
	const response = data as IssueListResponse;
	return response.items || [];
}

interface ProjectIssuesProps {
	project: Project;
}

function IssuesListSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-[400px] w-full" />
		</div>
	);
}

export function ProjectIssues({ project }: ProjectIssuesProps) {
	if (!project) {
		return <IssuesListSkeleton />;
	}

	const {
		data: issues,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["project-issues", project.id],
		queryFn: () => getProjectIssues(project.id),
		enabled: !!project.id,
	});

	if (isLoading) {
		return <IssuesListSkeleton />;
	}

	if (error) {
		return (
			<div className="rounded-md bg-destructive/15 p-4">
				<div className="text-sm text-destructive">{error.message}</div>
			</div>
		);
	}

	if (!issues || issues.length === 0) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<div className="text-center">
					<h3 className="text-lg font-medium">No issues found</h3>
					<p className="text-sm text-muted-foreground">
						Create your first issue to get started
					</p>
				</div>
			</div>
		);
	}

	return <IssuesList issues={issues} />;
}
