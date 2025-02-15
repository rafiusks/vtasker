"use client";

import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { Button } from "@/components/ui/button";

interface Props {
	children: React.ReactNode;
}

interface ErrorFallbackProps {
	error: Error;
	resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4">
			<div className="w-full max-w-md space-y-4 text-center">
				<h2 className="text-2xl font-bold">Something went wrong</h2>
				<p className="text-muted-foreground">{error.message}</p>
				<Button onClick={resetErrorBoundary}>Try again</Button>
			</div>
		</div>
	);
}

export function ErrorBoundary({ children }: Props) {
	const { reset } = useQueryErrorResetBoundary();

	return (
		<ReactErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
			{children}
		</ReactErrorBoundary>
	);
}
