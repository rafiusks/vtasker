"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCreateIssue } from "@/store";
import type { Issue } from "@/store/types";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const issueTemplates = [
	{
		id: "blank",
		name: "Blank Issue",
		description: "Start from scratch with an empty issue.",
		content: "",
	},
	{
		id: "bug",
		name: "Bug Report",
		description: "Report a bug or error in the application.",
		content: `## Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear and concise description of what you expected to happen.

## Actual Behavior
A clear and concise description of what actually happened.

## Additional Context
Add any other context about the problem here.`,
	},
	{
		id: "feature",
		name: "Feature Request",
		description: "Suggest a new feature or enhancement.",
		content: `## Description
A clear and concise description of the feature you'd like to see.

## Problem
What problem does this feature solve? Is it related to a problem?

## Proposed Solution
A clear and concise description of what you want to happen.

## Alternatives Considered
A clear and concise description of any alternative solutions or features you've considered.

## Additional Context
Add any other context or screenshots about the feature request here.`,
	},
];

interface CreateIssueDialogProps {
	projectId: string;
}

type IssueStatus = Issue["status"];
type IssuePriority = Issue["priority"];

export function CreateIssueDialog({ projectId }: CreateIssueDialogProps) {
	const router = useRouter();
	const createIssue = useCreateIssue();
	const [open, setOpen] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);

	const [formData, setFormData] = React.useState({
		title: "",
		description: "",
		status: "todo" as IssueStatus,
		priority: "medium" as IssuePriority,
		template: "blank",
	});

	const handleTemplateChange = (templateId: string) => {
		const template = issueTemplates.find((t) => t.id === templateId);
		setFormData((prev) => ({
			...prev,
			template: templateId,
			description: template?.content || "",
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			await createIssue({
				title: formData.title,
				description: formData.description,
				status: formData.status,
				priority: formData.priority,
				projectId,
			});
			setOpen(false);
			router.push(`/projects/${projectId}/issues`);
		} catch (error) {
			console.error("Failed to create issue:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" /> Create Issue
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create Issue</DialogTitle>
						<DialogDescription>
							Create a new issue to track tasks, bugs, or features.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="template">Template</Label>
							<Select
								value={formData.template}
								onValueChange={handleTemplateChange}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a template" />
								</SelectTrigger>
								<SelectContent>
									{issueTemplates.map((template) => (
										<SelectItem key={template.id} value={template.id}>
											{template.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-sm text-muted-foreground">
								{
									issueTemplates.find((t) => t.id === formData.template)
										?.description
								}
							</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								placeholder="Enter issue title"
								value={formData.title}
								onChange={(e) =>
									setFormData({ ...formData, title: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Enter issue description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								className="h-40"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="status">Status</Label>
								<Select
									value={formData.status}
									onValueChange={(value: IssueStatus) =>
										setFormData({ ...formData, status: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="todo">To Do</SelectItem>
										<SelectItem value="in_progress">In Progress</SelectItem>
										<SelectItem value="in_review">In Review</SelectItem>
										<SelectItem value="done">Done</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="priority">Priority</Label>
								<Select
									value={formData.priority}
									onValueChange={(value: IssuePriority) =>
										setFormData({ ...formData, priority: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select priority" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={!formData.title || isLoading}>
							{isLoading ? "Creating..." : "Create Issue"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
