import { PageHeader } from "@/components/page-header";
import { IssuesList } from "@/components/issues/issues-list";
import type { Issue } from "@/types";

async function getHighPriorityIssues() {
	try {
		const res = await fetch("/api/issues?priority=high", {
			method: "GET",
			cache: "no-store",
			next: {
				revalidate: 0,
			},
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.message || "Failed to fetch high priority issues");
		}

		const data = await res.json();
		return data;
	} catch (error) {
		console.error("Error fetching high priority issues:", error);
		throw error;
	}
}

export default async function HighPriorityIssuesPage() {
	const issues = await getHighPriorityIssues();

	return (
		<div className="container mx-auto py-6">
			<PageHeader
				title="High Priority Issues"
				description="View and manage high priority issues that need immediate attention"
			/>
			<div className="mt-6">
				<IssuesList issues={issues} showProject={true} />
			</div>
		</div>
	);
}
