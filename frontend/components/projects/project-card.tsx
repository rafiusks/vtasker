"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUpdateProject, useDeleteProject } from "@/store";
import type { Project } from "@/store/types";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Archive,
	MoreVertical,
	Pencil,
	Trash2,
	Users,
	FolderKanban,
	ListTodo,
} from "lucide-react";

interface ProjectCardProps {
	project: Project;
	view: "grid" | "list";
}

export function ProjectCard({ project, view }: ProjectCardProps) {
	const router = useRouter();
	const updateProject = useUpdateProject();
	const deleteProject = useDeleteProject();
	const [showDeleteAlert, setShowDeleteAlert] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);

	const handleArchive = async () => {
		setIsLoading(true);
		try {
			await updateProject(project.id, {
				...project,
				is_archived: !project.is_archived,
			});
		} catch (error) {
			console.error("Failed to archive project:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		setIsLoading(true);
		try {
			await deleteProject(project.id);
			setShowDeleteAlert(false);
		} catch (error) {
			console.error("Failed to delete project:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const cardContent = (
		<>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="line-clamp-1">{project.name}</CardTitle>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() => router.push(`/projects/${project.id}`)}
							>
								<FolderKanban className="mr-2 h-4 w-4" />
								View Project
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => router.push(`/projects/${project.id}/issues`)}
							>
								<ListTodo className="mr-2 h-4 w-4" />
								View Issues
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => router.push(`/projects/${project.id}/settings`)}
							>
								<Pencil className="mr-2 h-4 w-4" />
								Edit
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => router.push(`/projects/${project.id}/team`)}
							>
								<Users className="mr-2 h-4 w-4" />
								Manage Team
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleArchive}>
								<Archive className="mr-2 h-4 w-4" />
								{project.is_archived ? "Unarchive" : "Archive"}
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => setShowDeleteAlert(true)}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>
			<CardContent>
				<p className="line-clamp-2 text-sm text-muted-foreground">
					{project.description}
				</p>
			</CardContent>
			<CardFooter className="flex justify-between">
				<p className="text-sm text-muted-foreground">
					Created {new Date(project.createdAt).toLocaleDateString()}
				</p>
				{project.is_archived && (
					<span className="text-sm text-muted-foreground">Archived</span>
				)}
			</CardFooter>
		</>
	);

	return (
		<>
			<Link href={`/projects/${project.id}`}>
				<Card
					className={
						view === "grid"
							? "h-[200px]"
							: "transition-colors hover:bg-muted/50"
					}
				>
					{cardContent}
				</Card>
			</Link>

			<AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Are you sure you want to delete this project?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							project and all its data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isLoading ? "Deleting..." : "Delete Project"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
