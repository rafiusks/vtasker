import { notFound } from "next/navigation";
import { ProjectDetails } from "./project-details";
import { headers } from "next/headers";

async function getProject(id: string) {
	const headersList = headers();
	const host = headersList.get("host") || "localhost:3000";
	const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

	const res = await fetch(`${protocol}://${host}/api/projects/${id}`, {
		method: "GET",
		cache: "no-store",
	});

	if (!res.ok) {
		if (res.status === 404) {
			notFound();
		}
		throw new Error("Failed to fetch project");
	}

	return res.json();
}

export default async function ProjectPage({
	params,
}: {
	params: { id: string };
}) {
	const project = await getProject(params.id);

	return (
		<div className="container space-y-6">
			<ProjectDetails initialProject={project} />
		</div>
	);
}
