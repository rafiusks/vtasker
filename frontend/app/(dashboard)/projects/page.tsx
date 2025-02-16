"use client";

import * as React from "react";
import {
	useProjects,
	useProjectsLoading,
	useProjectsError,
	useFetchProjects,
} from "@/store";
import type { Project } from "@/store/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Grid, GridItem } from "@/components/ui/grid";
import { LayoutGrid, List } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectDialog } from "@/components/projects/create-project-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = "grid" | "list";
type SortField = "name" | "createdAt" | "updatedAt";
type SortOrder = "asc" | "desc";

function ProjectSkeleton({ view }: { view: ViewMode }) {
	return (
		<div className={view === "grid" ? "h-[200px]" : "h-[160px]"}>
			<div className="h-full space-y-4 rounded-lg border p-4">
				<div className="space-y-2">
					<Skeleton className="h-4 w-[250px]" />
					<Skeleton className="h-4 w-[200px]" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-20 w-full" />
				</div>
			</div>
		</div>
	);
}

export default function ProjectsPage() {
	const projects = useProjects();
	const isLoading = useProjectsLoading();
	const error = useProjectsError();
	const fetchProjects = useFetchProjects();

	const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
	const [searchQuery, setSearchQuery] = React.useState("");
	const [sortField, setSortField] = React.useState<SortField>("name");
	const [sortOrder, setSortOrder] = React.useState<SortOrder>("asc");
	const [showArchived, setShowArchived] = React.useState(false);

	React.useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	// Filter and sort projects
	const filteredProjects = React.useMemo(() => {
		return projects
			.filter((project: Project) => {
				const matchesSearch = project.name
					.toLowerCase()
					.includes(searchQuery.toLowerCase());
				const matchesArchived = showArchived ? true : !project.is_archived;
				return matchesSearch && matchesArchived;
			})
			.sort((a: Project, b: Project) => {
				const aValue = a[sortField];
				const bValue = b[sortField];
				const order = sortOrder === "asc" ? 1 : -1;
				return aValue < bValue ? -order : order;
			});
	}, [projects, searchQuery, showArchived, sortField, sortOrder]);

	const viewPanel = (
		<div className="p-4 space-y-4">
			<div className="space-y-2">
				<h3 className="font-medium">View Options</h3>
				<div className="flex items-center gap-2">
					<Button
						variant={viewMode === "grid" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setViewMode("grid")}
					>
						<LayoutGrid className="h-4 w-4 mr-2" />
						Grid
					</Button>
					<Button
						variant={viewMode === "list" ? "secondary" : "ghost"}
						size="sm"
						onClick={() => setViewMode("list")}
					>
						<List className="h-4 w-4 mr-2" />
						List
					</Button>
				</div>
			</div>

			<div className="space-y-2">
				<h3 className="font-medium">Sort</h3>
				<Select
					value={sortField}
					onValueChange={(value) => setSortField(value as SortField)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Sort by..." />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="name">Name</SelectItem>
						<SelectItem value="createdAt">Created Date</SelectItem>
						<SelectItem value="updatedAt">Updated Date</SelectItem>
					</SelectContent>
				</Select>
				<Select
					value={sortOrder}
					onValueChange={(value) => setSortOrder(value as SortOrder)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Order..." />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="asc">Ascending</SelectItem>
						<SelectItem value="desc">Descending</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<h3 className="font-medium">Filter</h3>
				<div className="flex items-center space-x-2">
					<input
						type="checkbox"
						id="showArchived"
						checked={showArchived}
						onChange={(e) => setShowArchived(e.target.checked)}
					/>
					<label htmlFor="showArchived">Show archived</label>
				</div>
			</div>
		</div>
	);

	const renderContent = () => {
		if (error) {
			return (
				<div className="flex h-[400px] items-center justify-center">
					<div className="text-center">
						<h3 className="text-lg font-medium">Error loading projects</h3>
						<p className="text-sm text-muted-foreground">{error}</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => fetchProjects()}
						>
							Try Again
						</Button>
					</div>
				</div>
			);
		}

		if (isLoading) {
			return viewMode === "grid" ? (
				<Grid className="grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: 6 }).map((_, i) => (
						<GridItem key={i}>
							<ProjectSkeleton view={viewMode} />
						</GridItem>
					))}
				</Grid>
			) : (
				<div className="space-y-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<ProjectSkeleton key={i} view={viewMode} />
					))}
				</div>
			);
		}

		if (filteredProjects.length === 0) {
			return (
				<div className="flex h-[400px] items-center justify-center">
					<div className="text-center">
						<h3 className="text-lg font-medium">No projects found</h3>
						<p className="text-sm text-muted-foreground">
							{searchQuery
								? "Try adjusting your search or filters"
								: "Create your first project to get started"}
						</p>
						<CreateProjectDialog />
					</div>
				</div>
			);
		}

		return viewMode === "grid" ? (
			<Grid className="grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{filteredProjects.map((project) => (
					<GridItem key={project.id}>
						<ProjectCard project={project} view={viewMode} />
					</GridItem>
				))}
			</Grid>
		) : (
			<div className="space-y-4">
				{filteredProjects.map((project) => (
					<ProjectCard key={project.id} project={project} view={viewMode} />
				))}
			</div>
		);
	};

	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<h2 className="text-3xl font-bold tracking-tight">Projects</h2>
				<div className="flex items-center space-x-2">
					<CreateProjectDialog />
				</div>
			</div>
			<div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
				{viewPanel}
				<div className="flex-1 space-y-4">
					<div className="flex items-center space-x-2">
						<div className="flex-1">
							<Input
								placeholder="Search projects..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="max-w-sm"
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
								<SelectItem value="name">Name</SelectItem>
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
					</div>
					{renderContent()}
				</div>
			</div>
		</div>
	);
}
