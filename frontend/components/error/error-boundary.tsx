"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
	children: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error to error reporting service
		console.error("Error caught by boundary:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return <ErrorDisplay error={this.state.error} />;
		}

		return this.props.children;
	}
}

function ErrorDisplay({ error }: { error: Error | null }) {
	const router = useRouter();

	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center p-4 text-center">
			<AlertTriangle className="h-10 w-10 text-destructive" />
			<h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
			<p className="mt-2 max-w-md text-muted-foreground">
				{error?.message || "An unexpected error occurred"}
			</p>
			<div className="mt-6 flex gap-4">
				<Button onClick={() => router.refresh()}>Try again</Button>
				<Button variant="outline" onClick={() => router.push("/")}>
					Go to home
				</Button>
			</div>
		</div>
	);
}
