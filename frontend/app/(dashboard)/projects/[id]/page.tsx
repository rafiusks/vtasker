import { notFound } from "next/navigation";
import {
	dehydrate,
	HydrationBoundary,
	QueryClient,
} from "@tanstack/react-query";
import ProjectDetails from "./project-details";
import { cookies } from "next/headers";

async function getProject(id: string) {
	const cookieStore = await cookies();
	const token = cookieStore.get("auth_token")?.value;

	const res = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/projects/${id}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		},
	);

	if (!res.ok) {
		if (res.status === 404) {
			notFound();
		}
		const error = await res.json();
		throw new Error(error.message || "Failed to fetch project");
	}

	return res.json();
}

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
	const { id } = await params;
	const queryClient = new QueryClient();

	await queryClient.prefetchQuery({
		queryKey: ["project", id],
		queryFn: () => getProject(id),
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<ProjectDetails id={id} />
		</HydrationBoundary>
	);
}
