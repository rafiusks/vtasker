"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useProjectsStore } from "@/store/projects";
import type { Project } from "@/store/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ChevronDown,
	ListTodo,
	Settings,
	Users,
	Archive,
	Trash2,
} from "lucide-react";
import { ProjectOverview } from "./project-overview";
import { ProjectIssues } from "./project-issues";
import Link from "next/link";
import { getDefaultHeaders } from "@/lib/config";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";

function ProjectSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<Skeleton className="h-8 w-[200px]" />
					<Skeleton className="h-4 w-[300px]" />
				</div>
				<div className="flex items-center gap-2">
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-24" />
					<Skeleton className="h-10 w-32" />
				</div>
			</div>
			<Skeleton className="h-[400px] w-full" />
		</div>
	);
}

interface ProjectDetailsProps {
	id: string;
}

export default function ProjectDetails({ id }: ProjectDetailsProps) {
	const router = useRouter();
	const { projects, setProjects, archiveProject, deleteProject } =
		useProjectsStore();
	const { isAuthenticated } = useAuth();

	React.useEffect(() => {
		if (!isAuthenticated) {
			router.push("/auth");
		}
	}, [isAuthenticated, router]);

	const {
		data: project,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["project", id],
		queryFn: () =>
			fetch(`/api/projects/${id}`, {
				headers: getDefaultHeaders(true),
				credentials: "include",
			}).then((res) => res.json()),
		enabled: isAuthenticated,
	});

	React.useEffect(() => {
		if (project) {
			setProjects([project]);
		}
	}, [project, setProjects]);

	if (isLoading) {
		return <ProjectSkeleton />;
	}

	if (error) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<div className="text-center">
					<h3 className="text-lg font-medium">Error loading project</h3>
					<p className="text-sm text-muted-foreground">{error.message}</p>
				</div>
			</div>
		);
	}

	if (!project) {
		return null;
	}

	const handleArchive = async () => {
		await archiveProject(id);
		router.push("/projects");
	};

	const handleDelete = async () => {
		try {
			// Check token availability
			const localStorageToken = localStorage.getItem("auth_token");
			const sessionStorageToken = sessionStorage.getItem("auth_token");
			const cookieToken = document.cookie
				.split(";")
				.find((c) => c.trim().startsWith("auth_token="))
				?.split("=")[1];

			console.log("Token check before delete:", {
				hasLocalStorage: !!localStorageToken,
				hasSessionStorage: !!sessionStorageToken,
				hasCookie: !!cookieToken,
				isAuthenticated,
			});

			if (
				!isAuthenticated ||
				(!localStorageToken && !sessionStorageToken && !cookieToken)
			) {
				toast({
					variant: "destructive",
					title: "Authentication Error",
					description: "You are not authenticated. Please sign in again.",
				});
				router.push("/auth");
				return;
			}

			// Set the token in the cookie before making the request
			const token = localStorageToken || sessionStorageToken || cookieToken;
			if (token) {
				document.cookie = `auth_token=${token}; path=/`;
			}

			await deleteProject(id);
			toast({
				title: "Project deleted",
				description: "The project has been successfully deleted.",
			});
			router.push("/projects");
		} catch (error) {
			console.error("Failed to delete project:", error);
			if (error instanceof Error && error.message.includes("Unauthorized")) {
				toast({
					variant: "destructive",
					title: "Authentication Error",
					description: "Your session has expired. Please sign in again.",
				});
				router.push("/auth");
				return;
			}
			toast({
				variant: "destructive",
				title: "Error",
				description:
					error instanceof Error
						? error.message
						: "Failed to delete project. Please try again.",
			});
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold">{project.name}</h1>
					<p className="text-sm text-muted-foreground">{project.description}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<Link href={`/projects/${id}/issues`}>
							<ListTodo className="mr-2 h-4 w-4" />
							Issues
						</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href={`/projects/${id}/team`}>
							<Users className="mr-2 h-4 w-4" />
							Team
						</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href={`/projects/${id}/settings`}>
							<Settings className="mr-2 h-4 w-4" />
							Settings
						</Link>
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={handleArchive}
						title="Archive project"
					>
						<Archive className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={handleDelete}
						title="Delete project"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">
								Quick Actions
								<ChevronDown className="ml-2 h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link href={`/projects/${id}/issues/new`}>
									Create New Issue
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href={`/projects/${id}/issues?status=in_progress`}>
									View In Progress Issues
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href={`/projects/${id}/issues?priority=high`}>
									View High Priority Issues
								</Link>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<Tabs defaultValue="overview" className="space-y-4">
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="issues">Issues</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="space-y-4">
					<ProjectOverview project={project} />
				</TabsContent>

				<TabsContent value="issues" className="space-y-4">
					<ProjectIssues project={project} />
				</TabsContent>

				<TabsContent value="settings" className="space-y-4">
					<div className="rounded-md bg-muted p-4">
						<p className="text-sm text-muted-foreground">
							Project settings coming soon...
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
