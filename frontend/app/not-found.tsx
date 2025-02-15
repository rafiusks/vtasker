"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
			<FileQuestion className="h-16 w-16 text-muted-foreground" />
			<h1 className="mt-6 text-4xl font-bold">Page not found</h1>
			<p className="mt-4 max-w-md text-muted-foreground">
				Sorry, we couldn't find the page you're looking for. The page might have
				been removed or the link might be broken.
			</p>
			<div className="mt-8 flex gap-4">
				<Button asChild>
					<Link href="/">Go to home</Link>
				</Button>
				<Button variant="outline" onClick={() => window.history.back()}>
					Go back
				</Button>
			</div>
		</div>
	);
}
