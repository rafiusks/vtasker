import axios from "axios";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export interface Service {
	name: string;
	namespace: string;
	status: "running" | "stopped" | "error";
	replicas: number;
	resources: {
		cpu: {
			usage: number;
			limit: number;
			requests: number;
		};
		memory: {
			usage: number;
			limit: number;
			requests: number;
		};
		network: {
			rxBytes: number;
			txBytes: number;
		};
	};
	configMaps: string[];
	secrets: string[];
	lastDeployment: string;
}

export interface ServiceMetrics {
	cpu: {
		usage: number[];
		timestamps: string[];
	};
	memory: {
		usage: number[];
		timestamps: string[];
	};
	network: {
		rxBytes: number[];
		txBytes: number[];
		timestamps: string[];
	};
}

export interface LogEntry {
	timestamp: string;
	level: string;
	message: string;
	service: string;
	container: string;
	pod: string;
}

export async function fetchServices(): Promise<Service[]> {
	const response = await api.get<Service[]>("/api/services");
	return response.data;
}

export async function fetchServiceMetrics(
	serviceName: string,
): Promise<ServiceMetrics> {
	const response = await api.get<ServiceMetrics>(
		`/api/services/${serviceName}/metrics`,
	);
	return response.data;
}

export async function startService(serviceName: string): Promise<void> {
	await api.post(`/api/services/${serviceName}/start`);
}

export async function stopService(serviceName: string): Promise<void> {
	await api.post(`/api/services/${serviceName}/stop`);
}

export async function restartService(serviceName: string): Promise<void> {
	await api.post(`/api/services/${serviceName}/restart`);
}

export async function scaleService(
	serviceName: string,
	replicas: number,
): Promise<void> {
	await api.post(`/api/services/${serviceName}/scale`, { replicas });
}

export async function updateServiceConfig(
	serviceName: string,
	config: any,
): Promise<void> {
	await api.put(`/api/services/${serviceName}/config`, config);
}

export async function rollbackService(
	serviceName: string,
	version: string,
): Promise<void> {
	await api.post(`/api/services/${serviceName}/rollback`, { version });
}
