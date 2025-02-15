"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PageLayout } from "@/components/layout/page-layout";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { signIn } = useAuth();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(e.currentTarget);
			const email = formData.get("email") as string;
			const password = formData.get("password") as string;

			await signIn(email, password);

			toast({
				title: "Welcome back!",
				description: "You have been successfully logged in.",
			});

			// Redirect to the return URL or dashboard
			const returnUrl = searchParams.get("returnUrl") || "/dashboard";
			router.push(decodeURIComponent(returnUrl));
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Invalid email or password. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<PageLayout>
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl text-center">Welcome back</CardTitle>
						<p className="text-center text-muted-foreground">
							Sign in to your account to continue
						</p>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<label
									htmlFor="email"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Email
								</label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
									disabled={isLoading}
								/>
							</div>
							<div className="space-y-2">
								<label
									htmlFor="password"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									Password
								</label>
								<Input
									id="password"
									name="password"
									type="password"
									required
									disabled={isLoading}
								/>
							</div>
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Signing in..." : "Sign in"}
							</Button>
						</form>
						<div className="mt-4 text-center text-sm">
							<Link
								href="/forgot-password"
								className="text-primary hover:underline"
							>
								Forgot your password?
							</Link>
						</div>
						<div className="mt-4 text-center text-sm">
							Don't have an account?{" "}
							<Link href="/register" className="text-primary hover:underline">
								Sign up
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</PageLayout>
	);
}
