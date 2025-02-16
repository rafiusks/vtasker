import { PageHeader } from "@/components/page-header";
import { IssuesList } from "@/components/issues/issues-list";
import type { Issue } from "@/types";

async function getActiveIssues() {
	try {
		const res = await fetch("/api/issues?status=open,in_progress", {
			method: "GET",
			cache: "no-store",
			next: {
				revalidate: 0,
			},
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.message || "Failed to fetch active issues");
		}

		const data = await res.json();
		return data;
	} catch (error) {
		console.error("Error fetching active issues:", error);
		throw error;
	}
}

export default async function ActiveIssuesPage() {
	const issues = await getActiveIssues();

	return (
		<div className="container mx-auto py-6">
			<PageHeader
				title="Active Issues"
				description="View and manage all active issues across your projects"
			/>
			<div className="mt-6">
				<IssuesList issues={issues} showProject={true} />
			</div>
		</div>
	);
}
