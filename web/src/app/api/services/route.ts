import { NextResponse } from "next/server";
import type { Service } from "@/lib/api";

const mockServices: Service[] = [
	{
		name: "frontend",
		namespace: "default",
		status: "running",
		replicas: 3,
		resources: {
			cpu: {
				usage: 0.45,
				limit: 1.0,
				requests: 0.5,
			},
			memory: {
				usage: 256 * 1024 * 1024, // 256MB
				limit: 512 * 1024 * 1024, // 512MB
				requests: 256 * 1024 * 1024, // 256MB
			},
			network: {
				rxBytes: 1024 * 1024, // 1MB
				txBytes: 512 * 1024, // 512KB
			},
		},
		configMaps: ["frontend-config"],
		secrets: ["frontend-secrets"],
		lastDeployment: new Date().toISOString(),
	},
	{
		name: "backend",
		namespace: "default",
		status: "running",
		replicas: 2,
		resources: {
			cpu: {
				usage: 0.65,
				limit: 2.0,
				requests: 1.0,
			},
			memory: {
				usage: 512 * 1024 * 1024, // 512MB
				limit: 1024 * 1024 * 1024, // 1GB
				requests: 512 * 1024 * 1024, // 512MB
			},
			network: {
				rxBytes: 2 * 1024 * 1024, // 2MB
				txBytes: 1024 * 1024, // 1MB
			},
		},
		configMaps: ["backend-config"],
		secrets: ["backend-secrets", "database-secrets"],
		lastDeployment: new Date().toISOString(),
	},
];

export async function GET() {
	return NextResponse.json(mockServices);
}
