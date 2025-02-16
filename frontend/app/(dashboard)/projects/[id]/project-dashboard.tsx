"use client";

import * as React from "react";
import type { Project } from "@/store/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart,
	Users,
	Clock,
	CheckCircle,
	AlertCircle,
	Activity,
} from "lucide-react";

interface ProjectDashboardProps {
	project: Project;
}

export function ProjectDashboard({ project }: ProjectDashboardProps) {
	return (
		<Tabs defaultValue="overview" className="space-y-4">
			<TabsList>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="activity">Activity</TabsTrigger>
				<TabsTrigger value="team">Team</TabsTrigger>
			</TabsList>

			<TabsContent value="overview" className="space-y-4">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Issues
							</CardTitle>
							<BarChart className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-muted-foreground">
								Across all statuses
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Team Members
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-muted-foreground">
								Active contributors
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">In Progress</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-muted-foreground">Active issues</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Completed</CardTitle>
							<CheckCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">0</div>
							<p className="text-xs text-muted-foreground">Resolved issues</p>
						</CardContent>
					</Card>
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
					<Card className="col-span-4">
						<CardHeader>
							<CardTitle>Issue Distribution</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-[200px] flex items-center justify-center text-muted-foreground">
								Chart coming soon
							</div>
						</CardContent>
					</Card>
					<Card className="col-span-3">
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
			</TabsContent>

			<TabsContent value="activity" className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Activity Feed</CardTitle>
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
			</TabsContent>

			<TabsContent value="team" className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Team Members</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-center py-8 text-muted-foreground">
							<Users className="h-8 w-8 mx-auto mb-4" />
							<p>No team members yet</p>
						</div>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	);
}
