import { useQuery } from "@tanstack/react-query";
import { fetchServiceMetrics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	ChartOptions,
} from "chart.js";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
);

const chartOptions: ChartOptions<"line"> = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			position: "top" as const,
		},
	},
	scales: {
		y: {
			beginAtZero: true,
		},
	},
};

interface ServiceMetricsProps {
	serviceName: string | null;
}

export function ServiceMetrics({ serviceName }: ServiceMetricsProps) {
	const { data: metrics, isLoading } = useQuery({
		queryKey: ["metrics", serviceName],
		queryFn: () => (serviceName ? fetchServiceMetrics(serviceName) : null),
		enabled: !!serviceName,
	});

	if (!serviceName) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Metrics</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[300px] flex items-center justify-center text-gray-500">
						Select a service to view metrics
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Metrics</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[300px] flex items-center justify-center">
						Loading metrics...
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!metrics) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Metrics</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="h-[300px] flex items-center justify-center text-gray-500">
						No metrics available
					</div>
				</CardContent>
			</Card>
		);
	}

	const cpuData = {
		labels: metrics.cpu.timestamps,
		datasets: [
			{
				label: "CPU Usage",
				data: metrics.cpu.usage,
				borderColor: "rgb(53, 162, 235)",
				backgroundColor: "rgba(53, 162, 235, 0.5)",
			},
		],
	};

	const memoryData = {
		labels: metrics.memory.timestamps,
		datasets: [
			{
				label: "Memory Usage",
				data: metrics.memory.usage,
				borderColor: "rgb(75, 192, 192)",
				backgroundColor: "rgba(75, 192, 192, 0.5)",
			},
		],
	};

	const networkData = {
		labels: metrics.network.timestamps,
		datasets: [
			{
				label: "Network RX",
				data: metrics.network.rxBytes,
				borderColor: "rgb(255, 99, 132)",
				backgroundColor: "rgba(255, 99, 132, 0.5)",
			},
			{
				label: "Network TX",
				data: metrics.network.txBytes,
				borderColor: "rgb(153, 102, 255)",
				backgroundColor: "rgba(153, 102, 255, 0.5)",
			},
		],
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Metrics</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3 gap-4">
					<div className="h-[300px]">
						<Line options={chartOptions} data={cpuData} />
					</div>
					<div className="h-[300px]">
						<Line options={chartOptions} data={memoryData} />
					</div>
					<div className="h-[300px]">
						<Line options={chartOptions} data={networkData} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
