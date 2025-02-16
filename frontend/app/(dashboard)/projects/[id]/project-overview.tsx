"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/store/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	BarChart,
	Users,
	Clock,
	CheckCircle,
	Activity,
	ListTodo,
} from "lucide-react";

interface ProjectOverviewProps {
	project: Project;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
	const router = useRouter();

	return (
		<div className="space-y-6">
			<div className="flex justify-end">
				<Button
					variant="outline"
					onClick={() => router.push(`/projects/${project.id}/issues`)}
				>
					<ListTodo className="mr-2 h-4 w-4" />
					View All Issues
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card
					className="cursor-pointer transition-colors hover:bg-muted/50"
					onClick={() => router.push(`/projects/${project.id}/issues`)}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Issues</CardTitle>
						<BarChart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Across all statuses</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Team Members</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Active contributors</p>
					</CardContent>
				</Card>
				<Card
					className="cursor-pointer transition-colors hover:bg-muted/50"
					onClick={() =>
						router.push(`/projects/${project.id}/issues?status=in_progress`)
					}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">In Progress</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Active issues</p>
					</CardContent>
				</Card>
				<Card
					className="cursor-pointer transition-colors hover:bg-muted/50"
					onClick={() =>
						router.push(`/projects/${project.id}/issues?status=done`)
					}
				>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Completed</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">0</div>
						<p className="text-xs text-muted-foreground">Resolved issues</p>
					</CardContent>
				</Card>

				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-8">
							<div className="flex items-center">
								<Activity className="mr-2 h-4 w-4 text-muted-foreground" />
								<div className="ml-4 space-y-1">
									<p className="text-sm font-medium leading-none">
										Project created
									</p>
									<p className="text-sm text-muted-foreground">
										{new Date(project.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
