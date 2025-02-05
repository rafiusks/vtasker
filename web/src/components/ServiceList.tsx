import { Service } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

interface ServiceListProps {
	services?: Service[];
	isLoading: boolean;
	selectedService: string | null;
	onSelectService: (serviceName: string) => void;
}

export function ServiceList({
	services,
	isLoading,
	selectedService,
	onSelectService,
}: ServiceListProps) {
	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Services</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={`skeleton-${i}`} className="h-16 w-full">
							<Skeleton className="h-full" />
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Services</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{services?.map((service) => (
					<button
						key={service.name}
						className={`w-full p-4 rounded-lg border cursor-pointer transition-colors text-left ${
							selectedService === service.name
								? "bg-primary/10 border-primary"
								: "hover:bg-gray-50 border-gray-200"
						}`}
						onClick={() => onSelectService(service.name)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								onSelectService(service.name);
							}
						}}
						type="button"
						role="tab"
						aria-selected={selectedService === service.name}
						tabIndex={0}
					>
						<div className="flex items-center justify-between">
							<div className="font-medium">{service.name}</div>
							<Badge
								variant={
									service.status === "running"
										? "success"
										: service.status === "error"
											? "destructive"
											: "secondary"
								}
							>
								{service.status}
							</Badge>
						</div>
						<div className="mt-2 text-sm text-gray-500">
							<div>Replicas: {service.replicas}</div>
							<div>Namespace: {service.namespace}</div>
						</div>
					</button>
				))}
			</CardContent>
		</Card>
	);
}
