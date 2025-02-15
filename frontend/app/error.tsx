"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error("Error:", error);
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
			<AlertTriangle className="h-16 w-16 text-destructive" />
			<h1 className="mt-6 text-4xl font-bold">Something went wrong!</h1>
			<p className="mt-4 max-w-md text-muted-foreground">
				{error.message ||
					"An unexpected error occurred. Please try again later."}
			</p>
			{error.digest && (
				<p className="mt-2 text-sm text-muted-foreground">
					Error ID: {error.digest}
				</p>
			)}
			<div className="mt-8 flex gap-4">
				<Button onClick={() => reset()}>Try again</Button>
				<Button variant="outline" onClick={() => window.location.reload()}>
					Refresh page
				</Button>
			</div>
		</div>
	);
}
