"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PageLayout } from "@/components/layout/page-layout";

export default function ForgotPasswordPage() {
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const formData = new FormData(e.currentTarget);
			const email = formData.get("email") as string;

			// TODO: Implement forgot password API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setIsSubmitted(true);
			toast({
				title: "Reset link sent",
				description: "Please check your email for the password reset link.",
			});
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to send reset link. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	if (isSubmitted) {
		return (
			<PageLayout>
				<div className="flex min-h-screen items-center justify-center p-4">
					<Card className="w-full max-w-md">
						<CardHeader className="space-y-1">
							<CardTitle className="text-2xl text-center">
								Check your email
							</CardTitle>
							<p className="text-center text-muted-foreground">
								We've sent you a password reset link. Please check your email.
							</p>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-center text-sm text-muted-foreground">
								Didn't receive the email? Check your spam folder or try again.
							</p>
							<div className="flex justify-center space-x-4">
								<Button variant="outline" onClick={() => setIsSubmitted(false)}>
									Try again
								</Button>
								<Button asChild>
									<Link href="/login">Back to login</Link>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</PageLayout>
		);
	}

	return (
		<PageLayout>
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md">
					<CardHeader className="space-y-1">
						<CardTitle className="text-2xl text-center">
							Reset your password
						</CardTitle>
						<p className="text-center text-muted-foreground">
							Enter your email address and we'll send you a reset link
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
							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? "Sending reset link..." : "Send reset link"}
							</Button>
						</form>
						<div className="mt-4 text-center text-sm">
							Remember your password?{" "}
							<Link href="/login" className="text-primary hover:underline">
								Sign in
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</PageLayout>
	);
}
