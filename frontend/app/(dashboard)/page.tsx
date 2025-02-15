"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/page-layout";

export default function HomePage() {
	return (
		<PageLayout>
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl text-center">
							Welcome to vTasker
						</CardTitle>
						<p className="text-center text-muted-foreground">
							Get started by signing in or creating an account
						</p>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button asChild className="w-full">
							<Link href="/login">Sign In</Link>
						</Button>
						<Button asChild variant="outline" className="w-full">
							<Link href="/register">Create Account</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</PageLayout>
	);
}
