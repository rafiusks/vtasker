import type { Issue } from "@/types";
import { IssueStatus, IssuePriority } from "@/types";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface IssuesListProps {
	issues: (Issue & { projectName?: string })[];
	showProject?: boolean;
}

export function IssuesList({ issues, showProject = false }: IssuesListProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Title</TableHead>
					{showProject && <TableHead>Project</TableHead>}
					<TableHead>Status</TableHead>
					<TableHead>Priority</TableHead>
					<TableHead>Created</TableHead>
					<TableHead>Updated</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{issues.map((issue) => (
					<TableRow key={issue.id}>
						<TableCell>
							<Link
								href={`/projects/${issue.projectId}/issues/${issue.id}`}
								className="hover:underline"
							>
								{issue.title}
							</Link>
						</TableCell>
						{showProject && issue.projectName && (
							<TableCell>
								<Link
									href={`/projects/${issue.projectId}`}
									className="hover:underline"
								>
									{issue.projectName}
								</Link>
							</TableCell>
						)}
						<TableCell>
							<Badge variant={getStatusVariant(issue.status) || "default"}>
								{formatStatus(issue.status)}
							</Badge>
						</TableCell>
						<TableCell>
							<Badge variant={getPriorityVariant(issue.priority) || "default"}>
								{formatPriority(issue.priority)}
							</Badge>
						</TableCell>
						<TableCell>{formatDate(issue.createdAt)}</TableCell>
						<TableCell>{formatDate(issue.updatedAt)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function getStatusVariant(
	status: IssueStatus,
): "default" | "secondary" | "destructive" | "outline" | null | undefined {
	switch (status) {
		case IssueStatus.TODO:
			return "default";
		case IssueStatus.IN_PROGRESS:
			return "secondary";
		case IssueStatus.IN_REVIEW:
			return "destructive";
		case IssueStatus.DONE:
			return "outline";
		default:
			return "default";
	}
}

function getPriorityVariant(
	priority: IssuePriority,
): "default" | "secondary" | "destructive" | "outline" | null | undefined {
	switch (priority) {
		case IssuePriority.HIGH:
			return "destructive";
		case IssuePriority.MEDIUM:
			return "secondary";
		case IssuePriority.LOW:
			return "default";
		default:
			return "default";
	}
}

function formatStatus(status: IssueStatus): string {
	switch (status) {
		case IssueStatus.TODO:
			return "To Do";
		case IssueStatus.IN_PROGRESS:
			return "In Progress";
		case IssueStatus.IN_REVIEW:
			return "In Review";
		case IssueStatus.DONE:
			return "Done";
		default:
			return status;
	}
}

function formatPriority(priority: IssuePriority): string {
	switch (priority) {
		case IssuePriority.HIGH:
			return "High";
		case IssuePriority.MEDIUM:
			return "Medium";
		case IssuePriority.LOW:
			return "Low";
		default:
			return priority;
	}
}
