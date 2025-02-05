import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceMetrics } from "@/components/service-metrics";

export default function MetricsPage() {
	return (
		<div className="container mx-auto py-6">
			<h1 className="text-2xl font-semibold mb-6">System Metrics</h1>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle>CPU Usage</CardTitle>
					</CardHeader>
					<CardContent>
						<ServiceMetrics serviceName="system" type="cpu" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Memory Usage</CardTitle>
					</CardHeader>
					<CardContent>
						<ServiceMetrics serviceName="system" type="memory" />
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Network Usage</CardTitle>
					</CardHeader>
					<CardContent>
						<ServiceMetrics serviceName="system" type="network" />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
