"use client";

import { useQuery } from "@tanstack/react-query";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	ChartData,
	ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
);

interface ServiceMetricsProps {
	serviceName: string;
	type: "cpu" | "memory" | "network";
}

interface MetricsData {
	timestamps: string[];
	values: number[];
}

async function fetchMetrics(
	serviceName: string,
	type: string,
): Promise<MetricsData> {
	const response = await fetch(
		`/api/services/${serviceName}/metrics?type=${type}`,
	);
	if (!response.ok) {
		throw new Error("Failed to fetch metrics");
	}
	return response.json();
}

export function ServiceMetrics({ serviceName, type }: ServiceMetricsProps) {
	const {
		data: metrics,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["metrics", serviceName, type],
		queryFn: () => fetchMetrics(serviceName, type),
	});

	if (isLoading) {
		return <div className="h-[200px] animate-pulse bg-muted rounded-md" />;
	}

	if (error) {
		return <div className="text-destructive">Failed to load metrics</div>;
	}

	if (!metrics) {
		return <div className="text-muted-foreground">No metrics available</div>;
	}

	const chartData: ChartData<"line"> = {
		labels: metrics.timestamps,
		datasets: [
			{
				label: type.charAt(0).toUpperCase() + type.slice(1),
				data: metrics.values,
				borderColor: "rgb(59, 130, 246)",
				backgroundColor: "rgba(59, 130, 246, 0.5)",
				tension: 0.3,
			},
		],
	};

	const options: ChartOptions<"line"> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			y: {
				type: "linear",
				beginAtZero: true,
				ticks: {
					callback: function (value) {
						if (type === "cpu") return `${value}%`;
						if (type === "memory") return `${value}MB`;
						if (type === "network") return `${value}KB/s`;
						return value;
					},
				},
			},
		},
	};

	return (
		<div className="h-[200px]">
			<Line data={chartData} options={options} />
		</div>
	);
}
