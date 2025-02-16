import { Issue } from "@/types";
import { api } from "@/lib/api";

export async function getActiveIssues(): Promise<Issue[]> {
	const response = await api.get("/api/issues", {
		params: {
			status: ["open", "in progress"],
		},
	});
	return response.data;
}

export async function getHighPriorityIssues(): Promise<Issue[]> {
	const response = await api.get("/api/issues", {
		params: {
			priority: "high",
		},
	});
	return response.data;
}
