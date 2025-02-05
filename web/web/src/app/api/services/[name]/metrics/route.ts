import { NextResponse } from "next/server";
import type { ServiceMetrics } from "@/lib/api";

function generateTimeSeriesData(length: number, min: number, max: number) {
	const now = Date.now();
	return {
		timestamps: Array.from({ length }, (_, i) =>
			new Date(now - (length - i - 1) * 60000).toISOString(),
		),
		values: Array.from({ length }, () => min + Math.random() * (max - min)),
	};
}

export async function GET(
	request: Request,
	{ params }: { params: { name: string } },
) {
	const cpuData = generateTimeSeriesData(30, 0, 1);
	const memoryData = generateTimeSeriesData(
		30,
		200 * 1024 * 1024,
		800 * 1024 * 1024,
	);
	const networkRxData = generateTimeSeriesData(
		30,
		0.5 * 1024 * 1024,
		3 * 1024 * 1024,
	);
	const networkTxData = generateTimeSeriesData(
		30,
		0.2 * 1024 * 1024,
		1.5 * 1024 * 1024,
	);

	const metrics: ServiceMetrics = {
		cpu: {
			usage: cpuData.values,
			timestamps: cpuData.timestamps,
		},
		memory: {
			usage: memoryData.values,
			timestamps: memoryData.timestamps,
		},
		network: {
			rxBytes: networkRxData.values,
			txBytes: networkTxData.values,
			timestamps: networkRxData.timestamps,
		},
	};

	return NextResponse.json(metrics);
}
