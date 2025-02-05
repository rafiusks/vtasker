"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface Service {
	name: string;
	namespace: string;
	status: string;
	replicas: number;
}

async function fetchServices(): Promise<Service[]> {
	const response = await fetch("/api/services");
	if (!response.ok) {
		throw new Error("Failed to fetch services");
	}
	return response.json();
}

export function ServiceList() {
	const [selectedService, setSelectedService] = useState<string | null>(null);
	const {
		data: services,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["services"],
		queryFn: fetchServices,
	});

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{[...Array(6)].map((_, i) => (
					<Card key={i} className="animate-pulse">
						<CardContent className="p-6">
							<div className="h-4 w-3/4 bg-muted rounded"></div>
							<div className="mt-4 space-y-2">
								<div className="h-3 w-1/2 bg-muted rounded"></div>
								<div className="h-3 w-1/3 bg-muted rounded"></div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<Card className="bg-destructive/10">
				<CardContent className="p-6">
					<p className="text-destructive">Failed to load services</p>
				</CardContent>
			</Card>
		);
	}

	if (!services?.length) {
		return (
			<Card>
				<CardContent className="p-6">
					<p className="text-muted-foreground">No services found</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{services.map((service) => (
				<button
					key={`${service.namespace}/${service.name}`}
					onClick={() => setSelectedService(service.name)}
					className={`w-full text-left ${
						selectedService === service.name
							? "ring-2 ring-primary"
							: "hover:bg-muted/50"
					}`}
				>
					<Card>
						<CardContent className="p-6">
							<h3 className="font-semibold">{service.name}</h3>
							<div className="mt-2 space-y-1">
								<p className="text-sm text-muted-foreground">
									Namespace: {service.namespace}
								</p>
								<p className="text-sm text-muted-foreground">
									Status: {service.status}
								</p>
								<p className="text-sm text-muted-foreground">
									Replicas: {service.replicas}
								</p>
							</div>
						</CardContent>
					</Card>
				</button>
			))}
		</div>
	);
}
