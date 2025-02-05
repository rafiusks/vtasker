"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "@/lib/api";
import { ServiceList } from "@/components/ServiceList";
import { ServiceMetrics } from "@/components/ServiceMetrics";
import { ServiceLogs } from "@/components/ServiceLogs";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OverviewPage() {
	return (
		<div className="container mx-auto py-6">
			<h1 className="text-2xl font-semibold mb-6">Overview</h1>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>Total Services</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">6</p>
						<p className="text-sm text-muted-foreground">Across 3 namespaces</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Active Replicas</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold">10</p>
						<p className="text-sm text-muted-foreground">All healthy</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>System Status</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-3xl font-bold text-green-500">Healthy</p>
						<p className="text-sm text-muted-foreground">
							All systems operational
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
