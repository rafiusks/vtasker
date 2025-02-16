"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ChevronDown,
	Filter,
	Grid,
	List,
	MoreHorizontal,
	Plus,
	Save,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CreateIssueDialog } from "@/components/issues/create-issue-dialog";
import type { Issue, IssueListResponse } from "@/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = "list" | "board";
type SortField = "title" | "status" | "priority" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";
type SavedView = {
	id: string;
	name: string;
	filters: {
		status?: string[];
		priority?: string[];
		assignee?: string[];
		search?: string;
	};
	sort: {
		field: SortField;
		order: SortOrder;
	};
};

type IssueStatus = "todo" | "in_progress" | "in_review" | "done";
type IssuePriority = "low" | "medium" | "high";

const statusColors: Record<IssueStatus, string> = {
	todo: "bg-blue-100 text-blue-800",
	in_progress: "bg-yellow-100 text-yellow-800",
	in_review: "bg-orange-100 text-orange-800",
	done: "bg-green-100 text-green-800",
};

const priorityColors: Record<IssuePriority, string> = {
	low: "bg-gray-100 text-gray-800",
	medium: "bg-yellow-100 text-yellow-800",
	high: "bg-red-100 text-red-800",
};

async function getProjectIssues(
	projectId: string,
	filters: {
		status?: string[];
		priority?: string[];
		search?: string;
		page?: number;
		pageSize?: number;
	},
): Promise<IssueListResponse> {
	const queryParams = new URLSearchParams();
	queryParams.append("project_id", projectId);
	queryParams.append("page", (filters.page || 1).toString());
	queryParams.append("page_size", (filters.pageSize || 10).toString());

	if (filters.status?.length) {
		queryParams.append("status", filters.status.join(","));
	}
	if (filters.priority?.length) {
		queryParams.append("priority", filters.priority.join(","));
	}
	if (filters.search) {
		queryParams.append("search", filters.search);
	}

	const res = await fetch(
		`/api/projects/${projectId}/issues?${queryParams.toString()}`,
		{
			method: "GET",
			cache: "no-store",
		},
	);

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

	return res.json();
}

export default function IssuesPage() {
	const params = useParams();
	const projectId = params?.id as string;

	if (!projectId) {
		return (
			<div className="rounded-md bg-destructive/15 p-4">
				<div className="text-sm text-destructive">Project ID is required</div>
			</div>
		);
	}

	const [viewMode, setViewMode] = React.useState<ViewMode>("list");
	const [selectedIssues, setSelectedIssues] = React.useState<string[]>([]);
	const [searchQuery, setSearchQuery] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState<string[]>([]);
	const [priorityFilter, setPriorityFilter] = React.useState<string[]>([]);
	const [sortField, setSortField] = React.useState<SortField>("createdAt");
	const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
	const [savedViews, setSavedViews] = React.useState<SavedView[]>([]);
	const [currentView, setCurrentView] = React.useState<SavedView | null>(null);

	const { data, isLoading, error } = useQuery({
		queryKey: [
			"project-issues",
			projectId,
			statusFilter,
			priorityFilter,
			searchQuery,
		],
		queryFn: () =>
			getProjectIssues(projectId, {
				status: statusFilter,
				priority: priorityFilter,
				search: searchQuery,
			}),
		enabled: !!projectId,
	});

	const filteredIssues = React.useMemo(() => {
		if (!data?.items) return [];

		return data.items.sort((a: Issue, b: Issue) => {
			const aValue = a[sortField];
			const bValue = b[sortField];
			const order = sortOrder === "asc" ? 1 : -1;
			return aValue < bValue ? -order : order;
		});
	}, [data?.items, sortField, sortOrder]);

	const handleBulkAction = (action: string) => {
		// TODO: Implement bulk actions
		console.log(`Bulk action ${action} on issues:`, selectedIssues);
	};

	const saveCurrentView = () => {
		const newView: SavedView = {
			id: Math.random().toString(36).substr(2, 9),
			name: `View ${savedViews.length + 1}`,
			filters: {
				status: statusFilter,
				priority: priorityFilter,
				search: searchQuery,
			},
			sort: {
				field: sortField,
				order: sortOrder,
			},
		};
		setSavedViews([...savedViews, newView]);
		setCurrentView(newView);
	};

	const loadView = (view: SavedView) => {
		setStatusFilter(view.filters.status || []);
		setPriorityFilter(view.filters.priority || []);
		setSearchQuery(view.filters.search || "");
		setSortField(view.sort.field);
		setSortOrder(view.sort.order);
		setCurrentView(view);
	};

	return (
		<div className="space-y-4 p-8">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl font-bold tracking-tight">Issues</h2>
				<div className="flex items-center space-x-2">
					<CreateIssueDialog projectId={projectId} />
					<Button
						variant="outline"
						size="icon"
						onClick={() => setViewMode(viewMode === "list" ? "board" : "list")}
					>
						{viewMode === "list" ? (
							<Grid className="h-4 w-4" />
						) : (
							<List className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Filters</CardTitle>
					<CardDescription>Filter and sort issues</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col space-y-4">
						<div className="flex items-center space-x-4">
							<div className="flex-1">
								<Input
									placeholder="Search issues..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
							<Select
								value={sortField}
								onValueChange={(v) => setSortField(v as SortField)}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="title">Title</SelectItem>
									<SelectItem value="status">Status</SelectItem>
									<SelectItem value="priority">Priority</SelectItem>
									<SelectItem value="createdAt">Created Date</SelectItem>
									<SelectItem value="updatedAt">Updated Date</SelectItem>
								</SelectContent>
							</Select>
							<Select
								value={sortOrder}
								onValueChange={(v) => setSortOrder(v as SortOrder)}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Sort order" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="asc">Ascending</SelectItem>
									<SelectItem value="desc">Descending</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="outline" onClick={saveCurrentView}>
								<Save className="mr-2 h-4 w-4" />
								Save View
							</Button>
						</div>
						<div className="flex items-center space-x-4">
							<Select
								value={statusFilter.join(",")}
								onValueChange={(v) => setStatusFilter(v ? v.split(",") : [])}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="todo">To Do</SelectItem>
									<SelectItem value="in_progress">In Progress</SelectItem>
									<SelectItem value="in_review">In Review</SelectItem>
									<SelectItem value="done">Done</SelectItem>
								</SelectContent>
							</Select>
							<Select
								value={priorityFilter.join(",")}
								onValueChange={(v) => setPriorityFilter(v ? v.split(",") : [])}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="low">Low</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="high">High</SelectItem>
								</SelectContent>
							</Select>
							{savedViews.length > 0 && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline">
											Saved Views
											<ChevronDown className="ml-2 h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										{savedViews.map((view) => (
											<DropdownMenuItem
												key={view.id}
												onClick={() => loadView(view)}
											>
												{view.name}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{selectedIssues.length > 0 && (
				<div className="flex items-center space-x-2 py-2">
					<span className="text-sm text-muted-foreground">
						{selectedIssues.length} issues selected
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleBulkAction("archive")}
					>
						Archive
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => handleBulkAction("delete")}
					>
						Delete
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setSelectedIssues([])}
					>
						Clear Selection
					</Button>
				</div>
			)}

			{error ? (
				<div className="rounded-md bg-destructive/15 p-4">
					<div className="text-sm text-destructive">{error.message}</div>
				</div>
			) : isLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 5 }, () => crypto.randomUUID()).map((id) => (
						<div key={id} className="h-16 animate-pulse rounded-lg bg-muted" />
					))}
				</div>
			) : filteredIssues.length === 0 ? (
				<div className="flex h-[400px] items-center justify-center">
					<div className="text-center">
						<h3 className="text-lg font-medium">No issues found</h3>
						<p className="text-sm text-muted-foreground">
							{searchQuery
								? "Try adjusting your search or filters"
								: "Create your first issue to get started"}
						</p>
						<CreateIssueDialog projectId={projectId} />
					</div>
				</div>
			) : viewMode === "list" ? (
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-12">
									<Checkbox
										checked={selectedIssues.length === filteredIssues.length}
										onCheckedChange={(checked) => {
											if (checked) {
												setSelectedIssues(
													filteredIssues.map((issue) => issue.id),
												);
											} else {
												setSelectedIssues([]);
											}
										}}
									/>
								</TableHead>
								<TableHead>Title</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Priority</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Updated</TableHead>
								<TableHead className="w-12" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredIssues.map((issue) => (
								<TableRow key={issue.id}>
									<TableCell>
										<Checkbox
											checked={selectedIssues.includes(issue.id)}
											onCheckedChange={(checked) => {
												if (checked) {
													setSelectedIssues([...selectedIssues, issue.id]);
												} else {
													setSelectedIssues(
														selectedIssues.filter((id) => id !== issue.id),
													);
												}
											}}
										/>
									</TableCell>
									<TableCell>{issue.title}</TableCell>
									<TableCell>
										<Badge
											className={cn(
												"text-xs font-medium",
												statusColors[issue.status as IssueStatus],
											)}
										>
											{issue.status.replace("_", " ")}
										</Badge>
									</TableCell>
									<TableCell>
										<Badge
											className={cn(
												"text-xs font-medium",
												priorityColors[issue.priority as IssuePriority],
											)}
										>
											{issue.priority}
										</Badge>
									</TableCell>
									<TableCell>
										{new Date(issue.createdAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										{new Date(issue.updatedAt).toLocaleDateString()}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem>View Details</DropdownMenuItem>
												<DropdownMenuItem>Edit</DropdownMenuItem>
												<DropdownMenuItem className="text-destructive">
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
					{["todo", "in_progress", "in_review", "done"].map((status) => (
						<div key={status} className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="font-medium capitalize">
									{status.replace("_", " ")}
								</h3>
								<Badge className={statusColors[status as IssueStatus]}>
									{filteredIssues.filter((i) => i.status === status).length}
								</Badge>
							</div>
							<div className="space-y-2">
								{filteredIssues
									.filter((issue) => issue.status === status)
									.map((issue) => (
										<Card key={issue.id}>
											<CardHeader className="p-4">
												<div className="flex items-start justify-between">
													<div className="space-y-1">
														<CardTitle className="text-sm">
															{issue.title}
														</CardTitle>
														<CardDescription className="text-xs">
															Created{" "}
															{new Date(issue.createdAt).toLocaleDateString()}
														</CardDescription>
													</div>
													<Badge
														className={
															priorityColors[issue.priority as IssuePriority]
														}
													>
														{issue.priority}
													</Badge>
												</div>
											</CardHeader>
										</Card>
									))}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
