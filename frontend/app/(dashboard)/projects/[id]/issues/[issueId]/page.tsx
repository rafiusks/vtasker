"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import {
	useCurrentIssue,
	useIssuesLoading,
	useIssuesError,
	useFetchIssues,
	useUpdateIssue,
} from "@/store";
import type { Issue } from "@/store/types";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
	Clock,
	MessageSquare,
	AlertCircle,
	CheckCircle,
	Activity,
} from "lucide-react";

const statusColors = {
	todo: "bg-slate-500",
	in_progress: "bg-blue-500",
	in_review: "bg-yellow-500",
	done: "bg-green-500",
} as const;

const priorityColors = {
	low: "bg-slate-500",
	medium: "bg-yellow-500",
	high: "bg-red-500",
} as const;

const statusWorkflow = {
	todo: ["in_progress"] as const,
	in_progress: ["in_review", "todo"] as const,
	in_review: ["done", "in_progress"] as const,
	done: ["todo"] as const,
} as const;

type IssueStatus = Issue["status"];
type IssuePriority = Issue["priority"];

export default function IssueDetailsPage() {
	const params = useParams();
	const projectId = params?.id as string;
	const issueId = params?.issueId as string;

	const issue = useCurrentIssue();
	const isLoading = useIssuesLoading();
	const error = useIssuesError();
	const fetchIssues = useFetchIssues();
	const updateIssue = useUpdateIssue();

	const [comment, setComment] = React.useState("");
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	React.useEffect(() => {
		fetchIssues(projectId);
	}, [fetchIssues, projectId]);

	const handleStatusChange = async (newStatus: IssueStatus) => {
		if (!issue) return;
		try {
			await updateIssue(issue.id, { status: newStatus });
		} catch (error) {
			console.error("Failed to update issue status:", error);
		}
	};

	const handlePriorityChange = async (newPriority: IssuePriority) => {
		if (!issue) return;
		try {
			await updateIssue(issue.id, { priority: newPriority });
		} catch (error) {
			console.error("Failed to update issue priority:", error);
		}
	};

	const handleCommentSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!comment.trim() || !issue) return;

		setIsSubmitting(true);
		try {
			// TODO: Implement comment creation
			console.log("Adding comment:", comment);
			setComment("");
		} catch (error) {
			console.error("Failed to add comment:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (error) {
		return (
			<div className="rounded-md bg-destructive/15 p-4">
				<div className="text-sm text-destructive">{error}</div>
			</div>
		);
	}

	if (isLoading || !issue) {
		return (
			<div className="space-y-4">
				<div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
				<div className="h-32 animate-pulse rounded-lg bg-muted" />
				<div className="h-64 animate-pulse rounded-lg bg-muted" />
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">{issue.title}</h1>
				<div className="flex items-center space-x-4">
					<Select value={issue.priority} onValueChange={handlePriorityChange}>
						<SelectTrigger className="w-[120px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="low">Low</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="high">High</SelectItem>
						</SelectContent>
					</Select>
					<Select value={issue.status} onValueChange={handleStatusChange}>
						<SelectTrigger className="w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{statusWorkflow[issue.status].map((status) => (
								<SelectItem key={status} value={status}>
									{status.replace("_", " ")}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<div className="md:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Description</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="prose max-w-none">
								{issue.description || "No description provided."}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Comments</CardTitle>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleCommentSubmit} className="space-y-4">
								<Textarea
									placeholder="Add a comment..."
									value={comment}
									onChange={(e) => setComment(e.target.value)}
								/>
								<Button
									type="submit"
									disabled={!comment.trim() || isSubmitting}
								>
									{isSubmitting ? "Adding..." : "Add Comment"}
								</Button>
							</form>
							<div className="mt-6">
								<p className="text-sm text-muted-foreground">
									No comments yet.
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Status</span>
								<Badge className={statusColors[issue.status]}>
									{issue.status.replace("_", " ")}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Priority</span>
								<Badge className={priorityColors[issue.priority]}>
									{issue.priority}
								</Badge>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Created</span>
								<span className="text-sm">
									{new Date(issue.createdAt).toLocaleDateString()}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Updated</span>
								<span className="text-sm">
									{new Date(issue.updatedAt).toLocaleDateString()}
								</span>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Activity</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<Activity className="mt-0.5 h-4 w-4 text-muted-foreground" />
									<div>
										<p className="text-sm">Issue created</p>
										<p className="text-xs text-muted-foreground">
											{new Date(issue.createdAt).toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
